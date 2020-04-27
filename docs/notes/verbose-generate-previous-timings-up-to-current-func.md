```js
  /**
     * See explanation in `src/utils/dpe-to-slate/index.js` for how this function works with css injection
     * to provide current paragaph's highlight.
     * @param {Number} currentTime - float in seconds
     */
    const generatePreviousTimingsUpToCurrent = (currentTime)=>{
      const lastWordStartTime = props.jsonData.words[props.jsonData.words.length-1].start;
      const lastWordStartTimeInt = parseInt(lastWordStartTime);
      const emptyListOfTimes = Array(lastWordStartTimeInt);
      const listOfTimesInt = [...emptyListOfTimes.keys()]
      const listOfTimesUpToCurrentTimeInt =  listOfTimesInt.splice(0, currentTime,0)
      const stringlistOfTimesUpToCurrentTimeInt  = listOfTimesUpToCurrentTimeInt.join(' ');
      return stringlistOfTimesUpToCurrentTimeInt;
    }

```

One line 
```js
  const generatePreviousTimingsUpToCurrent = (currentTime)=>{
      return    [...Array(parseInt(props.jsonData.words[props.jsonData.words.length-1].start)).keys()].splice(0, currentTime,0).join(' ');
    }
```