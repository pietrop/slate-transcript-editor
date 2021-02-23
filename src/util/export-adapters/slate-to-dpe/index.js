/**
 * converted from react-transcript-editor draftJS update timestamp helper function
 * https://github.com/pietrop/react-transcript-editor/blob/master/packages/components/timed-text-editor/UpdateTimestamps/index.js
 * similar to "update Timestamps" function
 */
import countWords from '../../count-words';
import updateBloocksTimestamps from './update-timestamps/update-bloocks-timestamps';
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

const converSlateToDpe = (currentContent) => {
  // using updateBloocksTimestamps instead of previous way to align
  // this should be more computationally efficient for now as it only adjust paragraphs that have changed
  // keeps source of truth in the blocks as opposed to compare to the dpe transcript
  // const alignedSlateParagraphs = updateBloocksTimestamps(currentContent);
  // const alignedWords = slateParagraphsToDpeWords(alignedSlateParagraphs);
  // assumes that words are already aligned and this is just doing a conversion between formats
  // the parent component handles keeping the words in sync
  const alignedWords = slateParagraphsToDpeWords(currentContent);
  const updatedContent = createDpeParagraphsFromSlateJs(currentContent, alignedWords);
  return { words: alignedWords, paragraphs: updatedContent };
};

export default converSlateToDpe;
