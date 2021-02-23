```js
if (saveTimer !== null) {
  clearTimeout(saveTimer);
}
const tmpSaveTimer = setTimeout(() => {
  if (mediaRef && mediaRef.current) {
    mediaRef.current.play();
  }
}, PAUSE_WHILTE_TYPING_TIMEOUT_MILLISECONDS);
setSaveTimer(tmpSaveTimer);
```
