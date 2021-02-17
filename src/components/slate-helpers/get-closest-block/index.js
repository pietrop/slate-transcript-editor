/*
 from ~https://github.com/dylans/slate-snippets#get-closest-block~
from https://github.com/ianstormtaylor/slate/blob/228f4fa94f61f42ca41feae2b3029ebb570e0480/packages/slate/src/transforms/text.ts#L108-L112
 const startBlock = Editor.above(editor, {
   match: (n) => Editor.isBlock(editor, n),
     at: start,
     voids,
 });
 return startBlock;
*/
import { Editor } from 'slate';

function getClosestBlock(editor) {
  const [blockNode, path] = Editor.above(editor, { match: (n) => Editor.isBlock(editor, n) });
  return [blockNode, path];
}
export default getClosestBlock;
