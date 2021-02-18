import { alignSTT } from 'stt-align-node';
import countWords, { removeExtraWhiteSpaces } from '../../../count-words';

function convertWordsToText(words) {
  return words
    .map((word) => {
      return word.text.trim();
    })
    .join(' ');
}

function isTextAndWordsListChanged({ text, words }) {
  const wordsText = convertWordsToText(words);
  // TODO: here could optimize to check against word length
  // and only transpose the timcods
  return !(removeExtraWhiteSpaces(text) === wordsText);
  //   if (text !== wordsText) {
  // const textCount = countWords(text);
  // const wordsCount = countWords(wordsText);
  // if (textCount === wordsCount) {
  //   return false;
  // }
  // else{
  // }
  //   }
  //   return false;
}

function updateBloocksTimestamps(slateJsValue) {
  console.log('slateJsValue', slateJsValue);
  return slateJsValue.map((block) => {
    const text = block.children[0].text;
    const words = block.children[0].words;
    if (isTextAndWordsListChanged({ text, words })) {
      const newBlock = JSON.parse(JSON.stringify(block));
      console.log('block', block);
      const alignedWords = alignSTT({ words }, text);
      console.log('alignedWordsTest', alignedWords);
      newBlock.children[0].words = alignedWords;
      return newBlock;
    } else {
      return block;
    }
  });
  //   return slateJsValue;
}

export default updateBloocksTimestamps;
