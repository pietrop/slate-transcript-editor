import assert from 'assert';
import * as R from 'ramda';
import { Descendant, Element } from 'slate';
import { alignSTT } from 'stt-align-node';
import { TranscriptWord } from 'types/slate';
import convertWordsToText from '../../../convert-words-to-text';
import { countChar, removeExtraWhiteSpaces, splitOnWhiteSpaces } from '../../../count-words';

export function isTextAndWordsListChanged({ text, words }) {
  const wordsText = convertWordsToText(words);
  // TODO: here could optimize to check against word length
  // and only transpose the timcods
  return !(removeExtraWhiteSpaces(text) === wordsText);
}

function isEqualNumberOfWords({ text, words }: { text: string; words: TranscriptWord[] }) {
  // Quick fix, if there's words with empty string in the block
  // for some issues further upstream, either in the initial conversion
  // from STT or in previosu alignments (?)
  const sanitizedWords = removeEmptyWords(words);
  const wordsText = convertWordsToText(sanitizedWords);
  const textCount = countChar(text);
  const wordsCount = countChar(wordsText);
  return textCount === wordsCount;
}

/**
 * quick workaround, sometime the alignment in alignSTT
 * module results in words with either no text attribute or an empty string
 * This removes those words as thy cause issue with the alignment
 * TODO: figure out a better fix in the alignSTT repo further upstream
 */
function removeEmptyWords(words: TranscriptWord[]): TranscriptWord[] {
  return words.filter((word) => {
    return word.text;
  });
}

export function alignBlock({ block, text, words }: { block: Descendant; text: any; words: TranscriptWord[] }) {
  const newBlock = R.clone(block);
  assert(Element.isElement(newBlock));
  // if same number of words in words list and text
  // then can do an optimization where you don't need to run diff
  // just transpose words onto the timecodes.
  // this assumes STT will be ok at recognising utterances
  // even if in worste case scenario it might have mis-identified the words
  if (isEqualNumberOfWords({ text, words })) {
    const textList = splitOnWhiteSpaces(text);
    const newWords = JSON.parse(JSON.stringify(words));
    newBlock.children[0].words = newWords.map((word, index) => {
      word.text = textList[index];
      return word;
    });
    return newBlock;
  }
  const alignedWords = alignSTT({ words }, text);
  newBlock.children[0].words = removeEmptyWords(alignedWords);
  return newBlock;
}

export function updateIndividualBlockTimestamps(block: Descendant): Element {
  assert(Element.isElement(block));
  const text = block.children[0].text;
  const words = block.children[0].words;
  if (isTextAndWordsListChanged({ text, words })) {
    const newBlockAligned = alignBlock({ block, text, words });
    return newBlockAligned;
  }
  return block;
}

// This option, diffs text and words in transcripts
function updateBloocksTimestamps(slateJsValue: Descendant[]): Element[] {
  return slateJsValue.map((block) => {
    return updateIndividualBlockTimestamps(block);
  });
}

export default updateBloocksTimestamps;
