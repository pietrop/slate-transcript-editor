# Apple script testing

Script to use with [apple script](https://en.wikipedia.org/wiki/AppleScript) to test and simulate correcting the text in the editor over extended period of time.

```js
delay 2
repeat 3000 times
    repeat 30 times
        tell application "System Events" to keystroke "SOME TEXT "
        delay 3
    end repeat
    delay 6
    tell application "System Events" to keystroke (ASCII character 31) --down arrow
    tell application "System Events" to keystroke (ASCII character 31) --down arrow
    tell application "System Events" to keystroke (ASCII character 31) --down arrow
end repeat
```

