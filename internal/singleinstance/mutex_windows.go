//go:build windows

package singleinstance

import (
	"fmt"
	"syscall"
	"unsafe"
)

const errorAlreadyExists syscall.Errno = 183

var (
	kernel32     = syscall.NewLazyDLL("kernel32.dll")
	createMutexW = kernel32.NewProc("CreateMutexW")
	closeHandle  = kernel32.NewProc("CloseHandle")
)

// Acquire creates a per-user named mutex. The returned boolean is false when
// another maintenance process already owns the mutex.
func Acquire(name string) (release func(), acquired bool, err error) {
	mutexName, err := syscall.UTF16PtrFromString(`Local\` + name)
	if err != nil {
		return nil, false, err
	}
	handle, _, callErr := createMutexW.Call(0, 0, uintptr(unsafe.Pointer(mutexName)))
	if handle == 0 {
		return nil, false, fmt.Errorf("create maintenance mutex: %w", callErr)
	}
	release = func() {
		_, _, _ = closeHandle.Call(handle)
	}
	if errno, ok := callErr.(syscall.Errno); ok && errno == errorAlreadyExists {
		release()
		return func() {}, false, nil
	}
	return release, true, nil
}
