# alternative alignment approaches using computation

Not suree if this will be useful, but thought I'd gather some approaches that use computation below

## weighted average of paragraph start and end times

This is quiet interesting altho I don’t fully understand all of it [/src/util/export-adapters/slate-to-dpe/index.js#L43-L100](https://github.com/clowdr-app/slate-transcript-editor/blob/master/src/util/export-adapters/slate-to-dpe/index.js#L43-L100)

in a fork of slate-transcript-editor

they commented out

```js
//const res = alignDiraizedText(linesWithSpeaker, sttJson);
```

and added an alternative way of doing it.

Is this line trying to do some kind of interpolation/math to re-calculate the times of the words without “alignment”? [/src/util/export-adapters/slate-to-dpe/index.js#L57](https://github.com/clowdr-app/slate-transcript-editor/blob/master/src/util/export-adapters/slate-to-dpe/index.js#L57)

counting the number of words, and then spacing them based on event time between the start/end of the range

```js
   start: (startTime * (nodeWords.length - idx) + endTime * idx) / nodeWords.length, // weighted average of paragraph start and end times
```

in context

```js
// import slateToText from '../txt';
import { Node } from 'slate';
// importing this way, coz it runs as client side code, and the module, align-diarized-text index.js contains and import to a
// helper module to generate html view, that contains and fs, and it breaks storybook webpack.
// TODO: refactor in ` align-diarized-text` so that it can work outside node only, but also in browser, without workaround
// const alignDiraizedText = require('../../../../node_modules/align-diarized-text/src/add-timecodes-to-quotes');
// const alignDiraizedText = require('align-diarized-text');
import alignDiraizedText from 'align-diarized-text';

// TODO: this function needs to be brough into alignDiraizedText
// and applied to paragraphs - to avoid boundaries overlapp
function adjustTimecodesBoundaries(words) {
  return words.map((word, index, arr) => {
    // excluding first element
    if (index != 0) {
      const previousWord = arr[index - 1];
      const currentWord = word;
      if (previousWord.end > currentWord.start) {
        word.start = previousWord.end;
      }

      return word;
    }

    return word;
  });
}

const prepSlateParagraphForAlignement = (slateData) => {
  const result = [];
  slateData.forEach((el, index) => {
    const newEl = {
      text: Node.string(el),
      // start: `${el.start}`,// workaround
      start: `${el.start}`, // workaround
      speaker: el.speaker,
      id: `${index}`,
    };
    result.push(newEl);
  });
  return result;
};
const converSlateToDpe = (data, sttJson) => {
  const linesWithSpeaker = prepSlateParagraphForAlignement(data);
  console.log('linesWithSpeaker', linesWithSpeaker);
  console.log('sttJson', sttJson);
  //const res = alignDiraizedText(linesWithSpeaker, sttJson);

  const res = linesWithSpeaker.map((line, idx) => {
    const startTime = parseFloat(line.start);
    const endTime = linesWithSpeaker.length > idx + 1 ? parseFloat(linesWithSpeaker[idx + 1].start) : startTime + 1;

    const nodeWords = line.text.split(/\s+/);
    const words = nodeWords.map((nodeWord, idx) => {
      const word = {
        start: (startTime * (nodeWords.length - idx) + endTime * idx) / nodeWords.length, // weighted average of paragraph start and end times
        end: (startTime * (nodeWords.length - (idx + 1)) + endTime * (idx + 1)) / nodeWords.length,
        text: nodeWord,
      };
      return word;
    });

    return {
      end: endTime,
      start: startTime,
      id: line.id,
      speaker: line.speaker,
      text: line.text,
      words,
    };
  });

  console.log('res', res);
  const words = res
    .map((paragraph) => {
      if (paragraph) {
        return paragraph.words;
      }
    })
    .flat();
  const paragraphs = res
    .map((paragraph) => {
      if (paragraph) {
        return {
          speaker: paragraph.speaker,
          start: parseFloat(paragraph.start),
          end: parseFloat(paragraph.end),
          id: paragraph.id,
        };
      }
    })
    .flat();
  // without adjusting the paragraph boundaries, can't go round trip
  // back to slate, coz it's not able to reliably interpolate
  // words and speaker again
  const paragraphsWithAdjustedBoundaries = adjustTimecodesBoundaries(paragraphs);
  return { words, paragraphs: paragraphsWithAdjustedBoundaries };
  //    return {words, paragraphs};
};

export default converSlateToDpe;
```

That could be extracted

```js
const text = `Call me Ishmael. Some years ago—never mind how long precisely—having
little or no money in my purse, and nothing particular to interest me
on shore, I thought I would sail about a little and see the watery part
of the world. It is a way I have of driving off the spleen and
regulating the circulation. Whenever I find myself growing grim about
the mouth; whenever it is a damp, drizzly November in my soul; whenever
I find myself involuntarily pausing before coffin warehouses, and
bringing up the rear of every funeral I meet; and especially whenever
my hypos get such an upper hand of me, that it requires a strong moral
principle to prevent me from deliberately stepping into the street, and
methodically knocking people’s hats off—then, I account it high time to
get to sea as soon as I can. This is my substitute for pistol and ball.
With a philosophical flourish Cato throws himself upon his sword; I
quietly take to the ship. There is nothing surprising in this. If they
but knew it, almost all men in their degree, some time or other,
cherish very nearly the same feelings towards the ocean with me.`;
const startTime = 1.2;
const endTime = 3.5;

function round(number) {
  return Math.round(number * 100) / 100;
}

function computeStartTime({ startTime, wordCount, index, endTime }) {
  return round((startTime * (wordCount - index) + endTime * index) / wordCount);
}

function computeEndTime({ startTime, wordCount, index, endTime }) {
  return round((startTime * (wordCount - (index + 1)) + endTime * (index + 1)) / wordCount);
}

function computeWordsTimings({ text, startTime, endTime }) {
  const nodeWords = text.trim().split(/\s+/);
  return nodeWords.map((nodeWord, idx) => {
    return {
      start: computeStartTime({ startTime, wordCount: nodeWords.length, index: idx, endTime }), //(startTime * (nodeWords.length - idx) + endTime * idx) / nodeWords.length, // weighted average of paragraph start and end times
      end: computeEndTime({ startTime, wordCount: nodeWords.length, index: idx, endTime }), // (startTime * (nodeWords.length - (idx + 1)) + endTime * (idx + 1)) / nodeWords.length,
      text: nodeWord,
    };
  });
}

const wordsList = computeWordsTimings({ text, startTime, endTime });
console.log(wordsList);
```

## PopcornJs srt paragraphs/lines to word timings

Reminds me of this code originally from PopcornJs, and used by @maboa in the hyperaud.io convert to convert from srt to word level timed text
[interpolateWordsTimesFromSentence.js](https://gist.github.com/pietrop/fdac1672d757ae09de5ef5abac7f8bf5) from [srtParserComposer](https://github.com/pietrop/srtParserComposer) [originally from "srt to word accurate time"](https://github.com/pietrop/srtParserComposer#srt-to-word-accurate-time)

also in ruby [srt_to_json_hypertranscript_converter.rb](https://gist.github.com/pietrop/c385b528915fc81d9cb8)

## word time euristic based on chat count

[wordDuration.js](https://gist.github.com/pietrop/94da62c00b477c5768fb57da52395e62)

```js
// Chris Baume BBC R&D heuristic to estimate duration of a word, based on looking across a number of transcripts.
// from https://github.com/chrisbaume/webaligner/blob/9458df57d854e9df64a54bc23a7f0856de49730f/webaligner.js#L7
// estimates the duration of a word, in seconds

function wordDuration(word) {
  return 0.08475 + 0.05379 * word.length;
}
```
