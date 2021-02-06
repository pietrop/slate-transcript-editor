import { generatePreviousTimingsUpToCurrentOne } from '../dpe-to-slate';

/**
 * See explanation in `src/utils/dpe-to-slate/index.js` for how this function works with css injection
 * to provide current paragaph's highlight.
 * @param {Number} currentTime - float in seconds
 */
import isEmpty from '../../util/is-empty';
/**
 *
 * @param {*} currentTime
 * @param {*} transcriptData - dpe transcript data with timecodes at word level
 */
// const generatePreviousTimingsUpToCurrent = (currentTime, transcriptData) => {
//   // edge case - empty transcription
//   if (isEmpty(transcriptData)) {
//     return '';
//   }
//   const lastWordStartTime = transcriptData.words[transcriptData.words.length - 1].start;
//   const lastWordStartTimeInt = parseInt(lastWordStartTime);
//   const emptyListOfTimes = Array(lastWordStartTimeInt);
//   const listOfTimesInt = [...emptyListOfTimes.keys()];
//   const listOfTimesUpToCurrentTimeInt = listOfTimesInt.splice(0, currentTime, 0);
//   const stringlistOfTimesUpToCurrentTimeInt = listOfTimesUpToCurrentTimeInt.join(' ');
//   return stringlistOfTimesUpToCurrentTimeInt;
// };

// export default generatePreviousTimingsUpToCurrent;

/**
 *
 * @param {*} currentTime
 * @param {*} transcriptDataSlateValue - slateJS value data with timecodes at paragraph level
 */
const generatePreviousTimingsUpToCurrent = (currentTime, transcriptDataSlateValue) => {
  // edge case - empty transcription
  if (isEmpty(transcriptDataSlateValue)) {
    return '';
  }
  const lastWordStartTime = transcriptDataSlateValue[transcriptDataSlateValue.length - 1].start;
  const lastWordStartTimeInt = parseInt(lastWordStartTime);
  const emptyListOfTimes = Array(lastWordStartTimeInt);
  const listOfTimesInt = [...emptyListOfTimes.keys()];
  const listOfTimesUpToCurrentTimeInt = listOfTimesInt.splice(0, currentTime, 0);
  const stringlistOfTimesUpToCurrentTimeInt = listOfTimesUpToCurrentTimeInt.join(' ');
  return stringlistOfTimesUpToCurrentTimeInt;
};

export default generatePreviousTimingsUpToCurrent;
