```js
const breakParagraph = () => {
  Editor.insertBreak(editor);
};
const insertTextInaudible = () => {
  Transforms.insertText(editor, '[INAUDIBLE]');
};

const handleInsertMusicNote = () => {
  Transforms.insertText(editor, '♫'); // or ♪
};
```
