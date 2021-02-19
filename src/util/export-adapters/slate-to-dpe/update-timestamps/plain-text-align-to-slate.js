import { alignSTT } from 'stt-align-node';
import { shortTimecode } from '../../../timecode-converter';
// import countWords from '../../../count-words';
import countWords from '../../../count-words';
import { generatePreviousTimingsUpToCurrentOne } from '../../../dpe-to-slate';
// import { createSlateContentFromSlateJsParagraphs } from './index';

const createSlateContentFromSlateJsParagraphs = (currentContent, newEntities) => {
  // Update entites to block structure.
  const updatedBlockArray = [];
  let totalWords = 0;

  for (const blockIndex in currentContent) {
    const block = currentContent[blockIndex];
    const text = block.children[0].text;
    // if copy and pasting large chunk of text
    // currentContentBlock, would not have speaker and start/end time info
    // so for updatedBlock, getting start time from first word in blockEntities
    // const wordsInBlock = (text.match(/\S+/g) || []).length;
    const wordsInBlock = countWords(text);
    const blockEntites = newEntities.slice(totalWords, totalWords + wordsInBlock);
    // const text = block.children[0].text;

    let speaker = block.speaker;
    const start = parseFloat(blockEntites[0].start);
    const end = parseFloat(blockEntites[blockEntites.length - 1].end);
    const currentParagraph = { start, end };
    if (!speaker) {
      speaker = 'U_UKN';
    }
    const updatedBlock = {
      type: 'timedText',
      speaker: speaker,
      start,
      previousTimings: generatePreviousTimingsUpToCurrentOne(blockEntites, start),
      startTimecode: shortTimecode(start),
      children: [
        {
          text: blockEntites
            .map((w) => {
              return w.text;
            })
            .join(' ')
            .trim(),
          words: blockEntites,
        },
      ],
    };

    updatedBlockArray.push(updatedBlock);
    totalWords += wordsInBlock;
  }
  return updatedBlockArray;
};

function plainTextalignToSlateJs(words, text, slateJsValue) {
  const alignedWords = alignSTT(words, text);
  const updatedBlockArray = createSlateContentFromSlateJsParagraphs(slateJsValue, alignedWords);
  return updatedBlockArray;
}

export default plainTextalignToSlateJs;
