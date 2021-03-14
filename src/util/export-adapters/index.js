/**
 * Adapters for Draft.js conversion
 * @param {json} slateValue - Draft.js blocks
 * @param {string} type - the type of file supported by the available adapters
 */

// Note: export adapter does not doo any alignment
// just converts between formats
import slateToText from './txt';
import converSlateToDpe from './slate-to-dpe';
import slateToDocx from '../export-adapters/docx';
import subtitlesExportOptionsList from './subtitles-generator/list';
import subtitlesGenerator from './subtitles-generator/index';

const captionTypeList = subtitlesExportOptionsList.map((list) => {
  return list.type;
});

export const isCaptionType = (type) => {
  const res = captionTypeList.includes(type);
  return res;
};
const exportAdapter = ({ slateValue, type, ext, transcriptTitle, speakers, timecodes, inlineTimecodes, hideTitle, atlasFormat }) => {
  switch (type) {
    case 'text':
      return slateToText({ value: slateValue, speakers, timecodes, atlasFormat });
    case 'json-slate':
      return slateValue;
    case 'json-digitalpaperedit':
      return converSlateToDpe(slateValue);
    case 'word':
      //   return { data: draftToDocx(slateValue, transcriptTitle), ext: 'docx' };
      return slateToDocx({
        title: transcriptTitle,
        value: slateValue,
        speakers,
        timecodes,
        inlineTimecodes,
        hideTitle,
      });
    default:
      if (isCaptionType(type)) {
        const editorContent = converSlateToDpe(slateValue);
        let subtitlesJson = subtitlesGenerator({
          words: editorContent.words,
          paragraphs: editorContent.paragraphs,
          type,
          slateValue,
        });
        return subtitlesJson;
      }
      // some default, unlikely to be called
      console.error('Did not recognise the export format ', type);
      return 'Did not recognise the export format';
  }
};

export default exportAdapter;
