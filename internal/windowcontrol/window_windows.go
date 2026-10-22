//go:build windows

package windowcontrol

import (
	"errors"
	"path/filepath"
	"strings"
	"syscall"
	"unsafe"
)

var (
	user32      = syscall.NewLazyDLL("user32.dll")
	kernel32    = syscall.NewLazyDLL("kernel32.dll")
	enumWindows = user32.NewProc("EnumWindows")
	isVisible   = user32.NewProc("IsWindowVisible")
	getOwner    = user32.NewProc("GetWindow")
	getPID      = user32.NewProc("GetWindowThreadProcessId")
	getRect     = user32.NewProc("GetWindowRect")
	isZoomed    = user32.NewProc("IsZoomed")
	postMessage = user32.NewProc("PostMessageW")
	showWindow  = user32.NewProc("ShowWindowAsync")
	openProcess = kernel32.NewProc("OpenProcess")
	closeHandle = kernel32.NewProc("CloseHandle")
	queryImage  = kernel32.NewProc("QueryFullProcessImageNameW")
)

// Run targets only Spotify's largest visible, unowned top-level window. It never
// sends commands to the foreground app or kills a process to close its window.
func Run(action string) error {
	if action != "minimize" && action != "maximize" && action != "close" {
		return errors.New("unsupported window action")
	}
	var target uintptr
	var largest int64
	callback := syscall.NewCallback(func(hwnd, _ uintptr) uintptr {
		visible, _, _ := isVisible.Call(hwnd)
		owner, _, _ := getOwner.Call(hwnd, 4)
		if visible == 0 || owner != 0 {
			return 1
		}
		var pid uint32
		getPID.Call(hwnd, uintptr(unsafe.Pointer(&pid)))
		process, _, _ := openProcess.Call(0x1000, 0, uintptr(pid))
		if process == 0 {
			return 1
		}
		buffer := make([]uint16, 1024)
		size := uint32(len(buffer))
		ok, _, _ := queryImage.Call(process, 0, uintptr(unsafe.Pointer(&buffer[0])), uintptr(unsafe.Pointer(&size)))
		closeHandle.Call(process)
		if ok == 0 || !strings.EqualFold(filepath.Base(syscall.UTF16ToString(buffer[:size])), "Spotify.exe") {
			return 1
		}
		var rect struct{ Left, Top, Right, Bottom int32 }
		getRect.Call(hwnd, uintptr(unsafe.Pointer(&rect)))
		area := int64(rect.Right-rect.Left) * int64(rect.Bottom-rect.Top)
		if area > largest {
			target, largest = hwnd, area
		}
		return 1
	})
	enumWindows.Call(callback, 0)
	if target == 0 {
		return errors.New("Spotify window was not found")
	}
	command := uintptr(6) // SW_MINIMIZE
	switch action {
	case "maximize":
		zoomed, _, _ := isZoomed.Call(target)
		command = 3 // SW_MAXIMIZE
		if zoomed != 0 {
			command = 9 // SW_RESTORE
		}
	case "close":
		if ok, _, err := postMessage.Call(target, 0x0010, 0, 0); ok == 0 {
			return err
		}
		return nil
	}
	if ok, _, err := showWindow.Call(target, command); ok == 0 {
		return err
	}
	return nil
}
