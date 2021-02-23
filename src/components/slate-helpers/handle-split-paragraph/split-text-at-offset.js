/**
 *
 * @param {string} text -text string
 * @param {number} offset - offset char number position/index
 */
function splitTextAtOffset(text, offset) {
  const textBefore = text.slice(0, offset);
  const textAfter = text.slice(offset);
  return [textBefore, textAfter];
}

export default splitTextAtOffset;
