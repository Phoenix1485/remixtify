//go:build windows

package singleinstance

import (
	"fmt"
	"os"
	"testing"
	"time"
)

func TestAcquirePreventsDuplicateAndReleases(t *testing.T) {
	name := fmt.Sprintf("RemixifyTest-%d-%d", os.Getpid(), time.Now().UnixNano())
	releaseFirst, acquired, err := Acquire(name)
	if err != nil {
		t.Fatal(err)
	}
	if !acquired {
		t.Fatal("first mutex acquisition was rejected")
	}

	releaseSecond, acquiredAgain, err := Acquire(name)
	if err != nil {
		releaseFirst()
		t.Fatal(err)
	}
	if acquiredAgain {
		releaseSecond()
		releaseFirst()
		t.Fatal("duplicate mutex acquisition succeeded")
	}
	releaseSecond()
	releaseFirst()

	releaseThird, acquiredAfterRelease, err := Acquire(name)
	if err != nil {
		t.Fatal(err)
	}
	if !acquiredAfterRelease {
		t.Fatal("mutex could not be reacquired after release")
	}
	releaseThird()
}
