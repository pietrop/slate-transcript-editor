import { shortTimecode } from '../timecode-converter';
/**
 * Helper function for OHMS format
 * OHMS is an open source indexing tool created by the University of Kentucky,
 * which is used by a number of cultural heritage institutions.
 * OHMS uses xml for the the index and a Word doc for the transcript
 * with timecodes at 30 second or 60 second intervals written in-line in the format of [hh:mm:ss]
 * `slate-transcript-editor` OHMS export option exports the word part.
 * Thi functions organises the words to add timecodes intervals at the required times.
 */

import convertWordsToText from '../convert-words-to-text';

const insertTimecodesInlineinWordsList = ({ intervalSeconds = 30, words, lastInsertTime = 0 }) => {
  const tmpWords = JSON.parse(JSON.stringify(words));
  const sortedWords = tmpWords.sort((a, b) => a.start - b.start);
  let newWords = [];

  for (const word of sortedWords) {
    if (word.start - lastInsertTime > intervalSeconds) {
      lastInsertTime = Math.floor(word.start / intervalSeconds) * intervalSeconds;
      const timecode = shortTimecode(lastInsertTime);
      newWords.push({
        start: word.start,
        end: word.start + (word.end - word.start) / 2,
        text: `[${timecode}]`,
      });
      word.start = word.start + (word.end - word.start) / 2;
    }

    newWords.push(word);
  }

  return [newWords, lastInsertTime];
};

const insertTimecodesInLineInSlateJs = (slateValue) => {
  let lastInsertTime = 0;
  return slateValue.map((block) => {
    const newBlock = JSON.parse(JSON.stringify(block));
    const [newWords, lastInsert] = insertTimecodesInlineinWordsList({
      words: newBlock.children[0].words,
      lastInsertTime,
    });
    lastInsertTime = lastInsert;
    newBlock.children[0].words = newWords;
    newBlock.children[0].text = convertWordsToText(newBlock.children[0].words);
    return newBlock;
  });
};

export default insertTimecodesInLineInSlateJs;
