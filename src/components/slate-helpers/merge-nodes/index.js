/*
https://docs.slatejs.org/api/transforms#transforms-mergenodes-editor-editor-options
Merge a node at the specified location with the previous node at the same depth. If no location is specified, use the selection. Resulting empty container nodes are removed.
Options supported: NodeOptions & {hanging?: boolean}
*/
import { Transforms } from 'slate';

function mergeNodes({ editor, options = {} }) {
  Transforms.mergeNodes(editor, options);
}
export default mergeNodes;
