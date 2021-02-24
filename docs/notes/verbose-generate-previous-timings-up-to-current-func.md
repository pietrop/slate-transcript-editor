# verbose-generate-previous-timings-up-to-current-func

```javascript
/**
 * See explanation in `src/utils/dpe-to-slate/index.js` for how this function works with css injection
 * to provide current paragaph's highlight.
 * @param {Number} currentTime - float in seconds
 */
const generatePreviousTimingsUpToCurrent = (currentTime) => {
  const lastWordStartTime = props.transcriptData.words[props.transcriptData.words.length - 1].start;
  const lastWordStartTimeInt = parseInt(lastWordStartTime);
  const emptyListOfTimes = Array(lastWordStartTimeInt);
  const listOfTimesInt = [...emptyListOfTimes.keys()];
  const listOfTimesUpToCurrentTimeInt = listOfTimesInt.splice(0, currentTime, 0);
  const stringlistOfTimesUpToCurrentTimeInt = listOfTimesUpToCurrentTimeInt.join(' ');
  return stringlistOfTimesUpToCurrentTimeInt;
};
```

One line

```javascript
const generatePreviousTimingsUpToCurrent = (currentTime) => {
  return [...Array(parseInt(props.transcriptData.words[props.transcriptData.words.length - 1].start)).keys()].splice(0, currentTime, 0).join(' ');
};
```

simplified without using words

```js
function generatePreviousTimingsUpToCurrent(start) {
  return new Array(parseInt(start))
    .fill(1)
    .map((_, i) => i + 1)
    .join(' ');
}
```
