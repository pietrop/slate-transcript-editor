/**
 * Get node by path
 * https://github.com/dylans/slate-snippets#get-node-by-path
 * Get the descendant node referred to by a specific path. If the path is an empty array, get the root node itself.
 * https://docs.slatejs.org/api/nodes
 */
import { Node } from 'slate';
function getNodebyPath({ editor, path }) {
  const node = Node.get(editor, path);
  return node;
}

export default getNodebyPath;
