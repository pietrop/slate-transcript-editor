# notes on debounce

This worked, to do auto/align when the user stops typing. It only calls it once.

Outside of the component

```js
import pDebounce from 'p-debounce';
...
const debouncedSave = pDebounce(updateBloocksTimestamps, 3000);
```

inside the component keydown

```js
const handleOnKeyDown = async (event) => {
      ...
  // value is the content of slateJS
  const alignedSlateData = await debouncedSave(value);
  setValue(alignedSlateData);
  setIsContentIsModified(false);
```

seems like having it inside the component was being effected by the components re-renders.

This could be used for pause while typing as well.
