// import slateToText from '../txt';
import { Node } from 'slate';

// importing this way, coz it runs as client side code, and the module, align-diarized-text index.js contains and import to a
// helper module to generate html view, that contains and fs, and it breaks storybook webpack.
// TODO: refactor in ` align-diarized-text` so that it can work outside node only, but also in browser, without workaround
const alignDiraizedText = require('../../../../node_modules/align-diarized-text/src/add-timecodes-to-quotes');
const prepSlateParagraphForAlignement = (slateData)=>{
    const result = [];
    slateData.forEach((el, index)=>{
       const newEl = {
            text:  Node.string(el),
            start: `${el.start}`,// workaround 
            speaker: el.speaker,
           id: `${index}`
       }
        result.push(newEl)
    })
    return result;
}
const converSlateToDpe = (data,sttJson)=>{
    const  linesWithSpeaker = prepSlateParagraphForAlignement(data);
    const res = alignDiraizedText(linesWithSpeaker, sttJson);
    const words =  res.map((paragraph)=>{
        return paragraph.words
    }).flat()
    const paragraphs =  res.map((paragraph)=>{
        return {
            speaker: paragraph.speaker,
            start: parseFloat(paragraph.start),
            end: parseFloat(paragraph.end),
            id: paragraph.id
        }
    }).flat()
   return {words, paragraphs};
}

export default converSlateToDpe;