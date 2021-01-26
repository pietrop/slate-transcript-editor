import formatSeconds from './util/format-seconds.js';

const vttGenerator = (vttJSON, speakers = false) => {
  let vttOut = 'WEBVTT\n\n';
  vttJSON.forEach((v, i) => {
    vttOut += `${i + 1}\n${formatSeconds(parseFloat(v.start))} --> ${formatSeconds(parseFloat(v.end))}\n${speakers ? `<v ${v.speaker}>` : ``}${
      v.text
    }\n\n`;
  });

  return vttOut;
};

export default vttGenerator;
