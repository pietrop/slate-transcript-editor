import convertDpeToSlate from '../dpe-to-slate';
import converSlateToDpe from '../export-adapters/slate-to-dpe/index.js';

const restoreTimecodes = ({slateValue,jsonData})=>{
    const aligneDpeData = converSlateToDpe(slateValue,jsonData);
    const alignedSlateData = convertDpeToSlate(aligneDpeData)
    return alignedSlateData;
  }

export default restoreTimecodes;