// import slateToText from '../txt';
import { Node } from 'slate';
// importing this way, coz it runs as client side code, and the module, align-diarized-text index.js contains and import to a
// helper module to generate html view, that contains and fs, and it breaks storybook webpack.
// TODO: refactor in ` align-diarized-text` so that it can work outside node only, but also in browser, without workaround
// const alignDiraizedText = require('../../../../node_modules/align-diarized-text/src/add-timecodes-to-quotes');
const alignDiraizedText = require('align-diarized-text');

// TODO: this function needs to be brough into alignDiraizedText
// and applied to paragraphs - to avoid boundaries overlapp
function adjustTimecodesBoundaries(words) {
  return words.map((word, index, arr) => {
    // excluding first element
    if (index != 0) {
      const previousWord = arr[index - 1];
      const currentWord = word;
      if (previousWord.end > currentWord.start) {
        word.start = previousWord.end;
      }

      return word;
    }

    return word;
  });
}

const prepSlateParagraphForAlignement = (slateData) => {
  const result = [];
  slateData.forEach((el, index) => {
    const newEl = {
      text: Node.string(el),
      // start: `${el.start}`,// workaround
      start: `${el.start}`, // workaround
      speaker: el.speaker,
      id: `${index}`,
    };
    result.push(newEl);
  });
  return result;
};

const convertSlateToDpePostAlignment = (res) => {
  const words = res
    .map((paragraph) => {
      if (paragraph) {
        return paragraph.words;
      }
    })
    .flat();
  const paragraphs = res
    .map((paragraph) => {
      if (paragraph) {
        return {
          speaker: paragraph.speaker,
          start: parseFloat(paragraph.start),
          end: parseFloat(paragraph.end),
          id: paragraph.id,
        };
      }
    })
    .flat();
  // without adjusting the paragraph boundaries, can't go round trip
  // back to slate, coz it's not able to reliably interpolate
  // words and speaker again
  const paragraphsWithAdjustedBoundaries = adjustTimecodesBoundaries(paragraphs);
  return { words, paragraphs: paragraphsWithAdjustedBoundaries };
  //    return {words, paragraphs};
};

const converSlateToDpe = (data, sttJson) => {
  const linesWithSpeaker = prepSlateParagraphForAlignement(data);
  console.log('linesWithSpeaker', linesWithSpeaker);
  console.log('sttJson', sttJson);
  const res = alignDiraizedText(linesWithSpeaker, sttJson);
  console.log('res', res);
  return convertSlateToDpePostAlignment(res);
};

export const convertSlateToDpeAsync = async (data, sttJson) => {
  const linesWithSpeaker = prepSlateParagraphForAlignement(data);
  console.log('linesWithSpeaker', linesWithSpeaker);
  console.log('sttJson', sttJson);

  const worker = new Worker('./align_worker.js', { type: 'module' });

  const returnPromise = new Promise((res, rej) => {
    worker.onmessage = (event) => {
      console.log('worker response', event.data);
      const postProcessed = convertSlateToDpePostAlignment(event.data);
      res(postProcessed);
    };
  });

  worker.postMessage([linesWithSpeaker, sttJson]);
  return returnPromise;
};

export default converSlateToDpe;
