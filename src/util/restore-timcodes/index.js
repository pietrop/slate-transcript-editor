// import convertDpeToSlate from '../dpe-to-slate';
// import { convertSlateToDpeAsync } from '../export-adapters/slate-to-dpe/index.js';
import updateTimestamps from '../update-timestamps';

// const restoreTimecodes = async ({ slateValue, transcriptData }) => {
//   const aligneDpeData = await convertSlateToDpeAsync(slateValue, transcriptData);
//   const alignedSlateData = convertDpeToSlate(aligneDpeData);
//   return alignedSlateData;
// };

const restoreTimecodes = async ({ slateValue, transcriptData }) => {
  return updateTimestamps(slateValue, transcriptData);
  // const alignedSlateData = convertDpeToSlate(aligneDpeData);
  // return alignedSlateData;
};

export default restoreTimecodes;
