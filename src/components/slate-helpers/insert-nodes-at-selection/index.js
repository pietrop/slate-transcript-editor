/*
https://github.com/dylans/slate-snippets#insert-node-at-beginning-of-document
// Insert nodes at selection

// https://docs.slatejs.org/api/transforms#transforms-insertnodes-editor-editor-nodes-node-or-node-options

Transforms.insertNodes(editor, [
  { type: 'inline_type', children: [{ text: 'some text', marks: [] }] },
  { text: ' and some text after the inline', marks: [] },
]);

https://github.com/dylans/slate-snippets#insert-inline--text--navigate-to-text
// Insert inline + text & navigate to text

Transforms.insertNodes(editor, [
    { type: 'link', url:'x', children: [{ text:'mja', marks:[] }] },
    { text: '', marks:[] },
]);
const nextPoint = Editor.after(editor, editor.selection.anchor);
Editor.setSelection(editor, {anchor:nextPoint, focus:nextPoint})
*/
import { Transforms, Editor } from 'slate';

/**
 *
 * @param {*} editor
 * @param {array} - list of slateJS blocks objects
 */
function insertNodesAtSelection({ editor, blocks, moveSelection = false, options = {} }) {
  Transforms.insertNodes(editor, [...blocks], options);
  // move selection to that point
  if (moveSelection) {
    const nextPoint = Editor.after(editor, editor.selection.anchor);
    Transforms.setSelection(editor, { anchor: nextPoint, focus: nextPoint });
  }
}

export default insertNodesAtSelection;
