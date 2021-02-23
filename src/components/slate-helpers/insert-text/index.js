import { Transforms } from 'slate';
const insertText = ({ editor, text = '[INAUDIBLE]' }) => {
  Transforms.insertText(editor, text);
};

export default insertText;
