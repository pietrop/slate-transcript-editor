/**
 *
 * @param {*} currentParagraph a dpe paragraph object, with start, and end attribute eg in seconds
 * @param {*} words a list of word objects with start and end attributes
 * @returns a lsit of words obejcts that are included in the given paragraphs
 */
const getWordsForParagraph = (currentParagraph, words) => {
  const { start, end } = currentParagraph;
  return words.filter((word) => {
    return word.start >= start && word.end <= end;
  });
};

export default getWordsForParagraph;
