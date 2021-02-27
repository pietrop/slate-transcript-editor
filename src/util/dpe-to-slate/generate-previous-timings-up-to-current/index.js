/**
 * See explanation in `src/utils/dpe-to-slate/index.js` for how this function works with css injection
 * to provide current paragaph's highlight.
 */

/**
 * Generate a list of times, each rounded up to int.
 * from zero to the provided `time`.
 * eg if `time` is 6, the list would be [0, 1, 2, 3, 4, 5]
 * @param {Number} time - float or int, time in seconds
 */

function generatePreviousTimingsUpToCurrent(start) {
  const startTimeInt = parseInt(start);
  if (start === 0) {
    return '';
  }
  if (start === 1) {
    return '0 1';
  }
  return new Array(startTimeInt)
    .fill(1)
    .map((_, i) => i + 1)
    .join(' ');
}

export default generatePreviousTimingsUpToCurrent;
