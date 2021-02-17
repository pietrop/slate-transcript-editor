// https://docs.slatejs.org/api/transforms#transforms-setselection-editor-editor-props-partial-less-than-range-greater-than
// Set new properties on the selection.
import { Transforms } from 'slate';
function setSelection({ editor, nextPoint }) {
  Transforms.setSelection(editor, { anchor: nextPoint, focus: nextPoint });
}
export default setSelection;
