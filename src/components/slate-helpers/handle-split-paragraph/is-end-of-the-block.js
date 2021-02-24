/**
 * This helper function checks if the cursor/caret is at the end of a line
 * by comparing the anchros offset with the focus offset and seeing if they are equal to the total number
 * of chars in that block
 *
 * There seems to be an alternative way of doing this that could also be exploreed
 * https://github.com/udecode/slate-plugins/blob/master/packages/slate-plugins/src/common/queries/isSelectionAtBlockEnd.ts
 */
function isEndOftheBlock({ anchorOffset, focusOffset, totlaChar }) {
  return anchorOffset === focusOffset && anchorOffset === totlaChar;
}

export default isEndOftheBlock;
