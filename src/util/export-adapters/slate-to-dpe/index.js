/**
 * converted from react-transcript-editor draftJS update timestamp helper function
 * https://github.com/pietrop/react-transcript-editor/blob/master/packages/components/timed-text-editor/UpdateTimestamps/index.js
 * similar to updateTimestamps
 */
import countWords from '../../count-words';
import updateTimestampsHelper from './update-timestamps/update-timestamps-helper';
/**
 * Transposes the timecodes from stt json list of words onto
 * dpe transcript with paragraphs and words
 */
export const createDpeParagraphsFromSlateJs = (currentContent, newEntities) => {
  // Update entites to block structure.
  let totalWords = 0;
  return currentContent.map((block) => {
    const text = block.children[0].text;
    const wordsInBlock = countWords(text);
    const blockEntites = newEntities.slice(totalWords, totalWords + wordsInBlock);
    let speaker = block.speaker;
    const start = parseFloat(blockEntites[0].start);
    const end = parseFloat(blockEntites[blockEntites.length - 1].end);
    if (!speaker) {
      speaker = 'U_UKN';
    }
    const updatedBlock = {
      speaker: speaker,
      start,
      end,
    };

    totalWords += wordsInBlock;
    return updatedBlock;
  });
};

// slateParagraphs with words attributes ToDpeWords
const slateParagraphsToDpeWords = (slateParagraphs) => {
  return slateParagraphs
    .map((block) => {
      return block.children[0].words;
    })
    .flat();
};
/**
 * Update timestamps usign stt-align module
 * @param {*} currentContent - slate js value
 * @param {*} words - list of stt words
 * @return dpe transcript with paragraphs and words
 */
const converSlateToDpe = (currentContent, words) => {
  const alignedSlateParagraphs = updateTimestampsHelper(currentContent, words);
  const alignedWords = slateParagraphsToDpeWords(alignedSlateParagraphs);
  const updatedContent = createDpeParagraphsFromSlateJs(currentContent, alignedWords);
  return { words: alignedWords, paragraphs: updatedContent };
};

export default converSlateToDpe;
