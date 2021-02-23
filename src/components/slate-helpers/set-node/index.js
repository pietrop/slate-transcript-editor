/*
https://github.com/dylans/slate-snippets#set-node

Transforms.setNodes(editor, { type: 'paragraph' }, { at: path });
*/

import { Transforms } from 'slate';

function setNode({ editor, block, path }) {
  Transforms.setNodes(editor, block, { at: path });
}

export default setNode;
