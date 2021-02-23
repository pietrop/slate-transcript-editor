/*
https://docs.slatejs.org/api/transforms#transforms-removenodes-editor-editor-options

Transforms.removeNodes(editor: Editor, options?)
Remove nodes at the specified location in the document. If no location is specified, remove the nodes in the selection.
Options supported: NodeOptions & {hanging?: boolean}

*/
import { Transforms } from 'slate';

function removeNodes({ editor, options = {} }) {
  Transforms.removeNodes(editor, options);
}
export default removeNodes;
