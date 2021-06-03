import formatSeconds from './compose-subtitles/util/format-seconds.js';
import textSegmentation from './presegment-text/text-segmentation/index.js';
import addLineBreakBetweenSentences from './presegment-text/line-break-between-sentences/index.js';
import foldWords from './presegment-text/fold/index.js';
import divideIntoTwoLines from './presegment-text/divide-into-two-lines/index.js';
import preSegmentText from './presegment-text/index.js';
import { getTextFromWordsList } from './presegment-text/index.js';

import ttmlGeneratorPremiere from './compose-subtitles/premiere.js';
import ittGenerator from './compose-subtitles/itt.js';
import ttmlGenerator from './compose-subtitles/ttml.js';
import srtGenerator from './compose-subtitles/srt.js';
import vttGenerator from './compose-subtitles/vtt.js';
import csvGenerator from './compose-subtitles/csv.js';
import countWords from '../../count-words';

function segmentedTextToList(text) {
  let result = text.split('\n\n');
  result = result.map((line) => {
    return line.trim();
  });

  return result;
}

function addTimecodesToLines(wordsList, paragraphs, lines) {
  wordsList = wordsList.filter((w) => w.text.length > 0);
  let startWordCounter = 0;
  let endWordCounter = 0;
  console.log('lines', lines);
  const results = lines
    .filter((l) => {
      return l;
    })
    .map((line) => {
      endWordCounter += countWords(line);
      const jsonLine = {
        text: line.trim(),
        start: wordsList[startWordCounter].start,
        end: wordsList[endWordCounter - 1].end,
        speaker: undefined,
      };
      // #-----------------|------|-----------------#
      const possibleParagraphs = paragraphs
        .filter((p) => jsonLine.start >= p.start && jsonLine.start < p.end)
        .map((p) => {
          const inParagraphEndTime = Math.min(jsonLine.end, p.end);
          const inParagraphDuration = inParagraphEndTime - jsonLine.start;

          const totalDuration = jsonLine.end - jsonLine.start;
          const pctInParagraph = inParagraphDuration / totalDuration;

          return {
            ...p,
            pctInParagraph,
          };
        })
        .sort((a, b) => b.pctInParagraph - a.pctInParagraph || a.start - b.start); // sort by % in paragraph descending, then start time ascending
      jsonLine.speaker = possibleParagraphs.length > 0 ? possibleParagraphs[0].speaker : 'UNKNOWN';
      startWordCounter = endWordCounter;

      return jsonLine;
    });

  return results;
}

function convertSlateValueToSubtitleJson(slateValue) {
  // there shouldn't be empty blocks in the slateJs content value
  // but adding a filter here to double check just in cases
  return slateValue
    .filter((block) => {
      return block;
    })
    .map((block) => {
      return {
        start: block.start,
        end: block.children[0].words[block.children[0].words.length - 1].end,
        speaker: block.speaker,
        text: block.children[0].text,
      };
    });
}

function preSegmentTextJson({ wordsList, paragraphs, numberOfCharPerLine }) {
  const result = preSegmentText(wordsList, numberOfCharPerLine);
  const segmentedTextArray = segmentedTextToList(result);
  return addTimecodesToLines(wordsList, paragraphs, segmentedTextArray);
}

function subtitlesComposer({
  words,
  paragraphs,
  type,
  numberOfCharPerLine,
  slateValue,
}: {
  words: any;
  paragraphs?: any;
  type: any;
  numberOfCharPerLine?: number;
  slateValue?: any;
}) {
  let subtitlesJson;
  if (type === 'vtt_speakers_paragraphs') {
    subtitlesJson = convertSlateValueToSubtitleJson(slateValue);
  } else {
    subtitlesJson = preSegmentTextJson({
      wordsList: words,
      paragraphs,
      numberOfCharPerLine,
    });
    console.log('subtitlesJson', subtitlesJson);
  }

  if (typeof words === 'string') {
    return preSegmentText(words, numberOfCharPerLine);
  }
  switch (type) {
    case 'premiereTTML':
      return ttmlGeneratorPremiere(subtitlesJson);
    case 'ttml':
      return ttmlGenerator(subtitlesJson);
    case 'itt':
      return ittGenerator(subtitlesJson);
    case 'srt':
      return srtGenerator(subtitlesJson);
    case 'vtt':
      return vttGenerator(subtitlesJson);
    case 'vtt_speakers':
      return vttGenerator(subtitlesJson, true);
    case 'vtt_speakers_paragraphs':
      return vttGenerator(subtitlesJson, true);
    case 'json':
      // converting timecodes to captions time stamps
      return subtitlesJson.map((line) => {
        line.start = formatSeconds(parseFloat(line.start)).replace('.', ',');
        line.end = formatSeconds(parseFloat(line.end)).replace('.', ',');
        return line;
      });
    case 'csv':
      return csvGenerator(subtitlesJson);
    case 'pre-segment-txt':
      return preSegmentText(words, numberOfCharPerLine);
    case 'txt':
      return preSegmentText(words, numberOfCharPerLine);
    default:
      return 'Could not find the subtitle format';
  }
}

export {
  textSegmentation,
  addLineBreakBetweenSentences,
  foldWords,
  divideIntoTwoLines,
  getTextFromWordsList,
  preSegmentText,
  ttmlGeneratorPremiere,
  ttmlGenerator,
  ittGenerator,
  srtGenerator,
  vttGenerator,
};

export default subtitlesComposer;
