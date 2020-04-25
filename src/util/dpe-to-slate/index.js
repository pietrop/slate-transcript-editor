import {
  shortTimecode
} from '../timecode-converter';
// import cuid from 'cuid';

import getWordTimingsBeforeCurrentParagraph from './get-word-timings-before-current-paragraph.js'

const convertDpeToSlate = (data)=>{
    const paaragraphs = data.paragraphs.map((paragraph)=>{
      const words = data.words.filter((word)=>{
        if ((word.start >= paragraph.start  ) && ( word.end <= paragraph.end  )) {
          return word
        }
      })

      // console.log(getWordTimingsBeforeCurrentParagraph(data, 10))

      const text = words.map((w)=>{return w.text}).join(' ');
      return {
        speaker: paragraph.speaker,
        start: paragraph.start,
        // previousTimings: getWordTimingsBeforeCurrentParagraph(data, paragraph),
        // pre-computing the display of the formatting here so that it doesn't need to convert it in leaf render
        startTimecode: shortTimecode(paragraph.start),
        type: 'timedText',
        children: [{text }],
        // words: words
      }
  })

   return paaragraphs;
}



export default convertDpeToSlate;