/**
 * Helper function
 * @param {array} words - dpe word objeect, with at list text attribute to be able to convert to string of text
 */
function convertWordsToText(words) {
  return words
    .map((word) => {
      return word.text ? word.text.trim() : '';
    })
    .join(' ');
}

export default convertWordsToText;
