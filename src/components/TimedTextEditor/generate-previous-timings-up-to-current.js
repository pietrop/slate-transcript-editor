import { generatePreviousTimingsUpToCurrentOne } from '../../util/dpe-to-slate';

/**
 * See explanation in `src/utils/dpe-to-slate/index.js` for how this function works with css injection
 * to provide current paragaph's highlight.
 * @param {Number} currentTime - float in seconds
 */
import isEmpty from '../../util/is-empty';
const generatePreviousTimingsUpToCurrent = (currentTime, transcriptData) => {
  // edge case - empty transcription
  if (isEmpty(transcriptData)) {
    return '';
  }
  const lastWordStartTime = transcriptData.words[transcriptData.words.length - 1].start;
  const lastWordStartTimeInt = parseInt(lastWordStartTime);
  const emptyListOfTimes = Array(lastWordStartTimeInt);
  const listOfTimesInt = [...emptyListOfTimes.keys()];
  const listOfTimesUpToCurrentTimeInt = listOfTimesInt.splice(0, currentTime, 0);
  const stringlistOfTimesUpToCurrentTimeInt = listOfTimesUpToCurrentTimeInt.join(' ');
  return stringlistOfTimesUpToCurrentTimeInt;
};

export default generatePreviousTimingsUpToCurrent;
