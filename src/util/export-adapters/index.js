/**
 * Adapters for Draft.js conversion
 * @param {json} slateValue - Draft.js blocks
 * @param {string} type - the type of file supported by the available adapters
 */

import slateToText from './txt';
import { converSlateToDpe } from '../update-timestamps';
import slateToDocx from '../export-adapters/docx';
import subtitlesExportOptionsList from './subtitles-generator/list';
import subtitlesGenerator from './subtitles-generator/index';

const captionTypeList = subtitlesExportOptionsList.map((list) => {
  return list.type;
});

const isCaptionType = (type) => {
  const res = captionTypeList.includes(type);
  return res;
};
const exportAdapter = ({
  slateValue,
  type,
  ext,
  transcriptTitle,
  speakers,
  timecodes,
  inlineTimecodes: inline,
  hideTitle,
  atlasFormat,
  dpeTranscriptData,
}) => {
  switch (type) {
    case 'text':
      return slateToText({ value: slateValue, speakers, timecodes, atlasFormat });
    case 'json-slate':
      return slateValue;
    case 'json-digitalpaperedit':
      return converSlateToDpe(slateValue, dpeTranscriptData);
    case 'word':
      //   return { data: draftToDocx(slateValue, transcriptTitle), ext: 'docx' };
      return slateToDocx({
        value: slateValue,
        speakers,
        timecodes,
        inline_speakers: inline,
        title: transcriptTitle,
        hideTitle,
      });
    default:
      if (isCaptionType(type)) {
        const editorContent = converSlateToDpe(slateValue, dpeTranscriptData);
        let subtitlesJson = subtitlesGenerator({
          words: editorContent.words,
          paragraphs: editorContent.paragraphs,
          type,
        });
        return subtitlesJson;
      }
      // some default, unlikely to be called
      console.error('Did not recognise the export format ', type);
      return 'Did not recognise the export format';
  }
};

export default exportAdapter;
