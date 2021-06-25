import formatSeconds from '../util/format-seconds.js';

/**
 * from issue https://github.com/newscorp-ghfb/dj-tools-transcribe/issues/70
 * > prepend each cell field with a single quote, so that their content will be read as text by the spreadsheet editor.
 * @param {string} text
 * @returns {string}
 */
function escapeStringForCSV(text) {
  return `'${text}`;
}

// seconds to HH:MM:SS,000
function formatTimecodesInSrtFormat(seconds) {
  return formatSeconds(parseFloat(seconds)).replace('.', ',');
}

function csvGenerator(srtJsonContent) {
  const csvHeader = 'N,In,Out,Speaker,Text';

  const csvBody = srtJsonContent
    .map(({ start, end, speaker, text }, index) => {
      const lineIndex = `${index + 1}`;
      const startTimecode = `\"${formatTimecodesInSrtFormat(start)}\"`;
      const endTimecode = `\"${formatTimecodesInSrtFormat(end)}\"`;
      // removing line breaks and and removing " as they break the csv.
      // wrapping text in escaped " to  escape any , for the csv.
      // adding carriage return \n to signal end of line in csv
      // Preserving line break within srt lines to allow round trip from csv back to srt file in same format.
      // by replacing \n with \r\n.
      const speakerLabel = `\"${escapeStringForCSV(speaker.replace(/\n/g, ' '))}\"`;
      const textField = `\"${escapeStringForCSV(text.replace(/\n/g, ' '))}\"`;
      const csvLine = `${lineIndex},${startTimecode},${endTimecode},${speakerLabel},${textField}`;
      return csvLine;
    })
    .join('\n');

  const csvContent = `${csvHeader}\n${csvBody}`;
  return csvContent;
}

export default csvGenerator;
