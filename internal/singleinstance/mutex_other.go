//go:build !windows

package singleinstance

// Acquire is a no-op outside Windows because automatic maintenance is only
// registered by the Windows installer.
func Acquire(_ string) (release func(), acquired bool, err error) {
	return func() {}, true, nil
}
