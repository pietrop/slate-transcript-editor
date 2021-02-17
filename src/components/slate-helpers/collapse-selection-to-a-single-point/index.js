// https://docs.slatejs.org/api/transforms#transforms-collapse-editor-editor-options
// Collapse the selection to a single point.
// Options: {edge?: 'anchor' | 'focus' | 'start' | 'end'}

import { Transforms } from 'slate';
function collapseSelectionToAsinglePoint(editor) {
  Transforms.collapse(editor, { edge: 'start' });
}

export default collapseSelectionToAsinglePoint;
