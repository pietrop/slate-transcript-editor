/**
 *
 * @param {[string]} words -text string
 * @param {number} offset - offset char number position/index
 */
function splitWordsListAtOffset(words: string[], offset: number) {
  const tmpWords = JSON.parse(JSON.stringify(words));
  const wordsAfter = tmpWords.splice(offset);
  const wordsBefore = tmpWords;
  return [wordsBefore, wordsAfter];
}

export default splitWordsListAtOffset;
