/**
 * converted from react-transcript-editor draftJS update timestamp helper function
 * https://github.com/pietrop/react-transcript-editor/blob/master/packages/components/timed-text-editor/UpdateTimestamps/index.js
 * similar to updateTimestamps
 */
import { alignSTT } from 'stt-align-node';
import slateToText from '../txt';
import countWords from '../../count-words';
/**
 * Transposes the timecodes from stt json list of words onto
 * dpe transcript with paragraphs and words
 */
const createParagraphsFromSlateJs = (currentContent, newEntities) => {
  // Update entites to block structure.
  const updatedBlockArray = [];
  let totalWords = 0;

  for (const blockIndex in currentContent) {
    const block = currentContent[blockIndex];
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

    updatedBlockArray.push(updatedBlock);
    totalWords += wordsInBlock;
  }
  return updatedBlockArray;
};

/**
 * Update timestamps usign stt-align module
 * @param {*} currentContent - slate js value
 * @param {*} words - list of stt words
 * @return dpe transcript with paragraphs and words
 */
const converSlateToDpe = (currentContent, words) => {
  const currentText = slateToText({ value: currentContent, speakers: false, timecodes: false, atlasFormat: false });
  const alignedWords = alignSTT(words, currentText);
  const updatedContent = createParagraphsFromSlateJs(currentContent, alignedWords);
  return { words: alignedWords, paragraphs: updatedContent };
};

export default converSlateToDpe;
