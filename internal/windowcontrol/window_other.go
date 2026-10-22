//go:build !windows

package windowcontrol

import "errors"

func Run(string) error { return errors.New("custom window controls are available on Windows") }
