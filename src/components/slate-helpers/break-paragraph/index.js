import { Editor } from 'slate';

const breakParagraph = (editor) => {
  Editor.insertBreak(editor);
};

export default breakParagraph;
