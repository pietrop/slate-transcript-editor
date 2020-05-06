const fs = require('fs');
const DEMO_SOLEIO = require('../sample-data/soleio-dpe.json');
/**
 *
 * helper funciton to simulate data structure for live
 */
function findWordsRangeForQuoteInTranscript({ paragraph, words }) {
  const paragraphStart = paragraph.start;
  const paragraphEnd = paragraph.end;
  const wordResults = words.filter(word => {
    return word.start >= paragraphStart && word.end <= paragraphEnd;
  });
  return wordResults;
}

function segmentedTranscript(transcript) {
  return transcript.paragraphs.map(paragraph => {
    const wordsResult = findWordsRangeForQuoteInTranscript({ paragraph, words: transcript.words });
    return { words: wordsResult, paragraphs: [paragraph] };
  });
}

const result = segmentedTranscript(DEMO_SOLEIO);
fs.writeFileSync('./src/sample-data/segmented-transcript-soleio-dpe.json', JSON.stringify(result, null, 2));
