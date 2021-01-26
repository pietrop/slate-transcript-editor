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
  const results = lines.map((line) => {
    endWordCounter += countWords(line);

    const jsonLine = { text: line.trim() };
    jsonLine.start = wordsList[startWordCounter].start;
    jsonLine.end = wordsList[endWordCounter - 1].end;

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

function segmentTextByParagraph(wordList, paragraphs) {
  let str = [];
  let p_id = '0';

  const sorted_paragraphs = paragraphs.sort((a, b) => a.start - b.start);
  for (const { text, start } of wordList) {
    const foundParagraph = sorted_paragraphs.filter((p) => p.start <= start && p.end >= start)[0];
    if (foundParagraph.id !== p_id) {
      p_id = foundParagraph.id;
      str.push('\n\n');
    }
    str.push(text);
  }
  return str.join(' ');
}

function preSegmentTextJson(wordsList, paragraphs, numberOfCharPerLine, paragraphMode = false) {
  let result;
  if (paragraphMode) {
    result = segmentTextByParagraph(wordsList, paragraphs);
  } else {
    result = preSegmentText(wordsList, numberOfCharPerLine);
  }

  const segmentedTextArray = segmentedTextToList(result);

  return addTimecodesToLines(wordsList, paragraphs, segmentedTextArray);
}

function subtitlesComposer({ words, paragraphs, type, numberOfCharPerLine }) {
  const subtitlesJson = preSegmentTextJson(words, paragraphs, numberOfCharPerLine, type === 'vtt_speakers_paragraphs');
  if (typeof words === 'string') {
    return preSegmentText(words, numberOfCharPerLine);
  }
  switch (type) {
    case 'premiere':
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
      return {
        ttml: ttmlGenerator(subtitlesJson),
        premiere: ttmlGeneratorPremiere(subtitlesJson),
        itt: ittGenerator(subtitlesJson),
        srt: srtGenerator(subtitlesJson),
        vtt: vttGenerator(subtitlesJson),
        vtt_speakers: vttGenerator(subtitlesJson, true),
        json: subtitlesJson,
      };
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
