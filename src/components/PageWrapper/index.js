import React, { useState } from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import SlateTranscriptEditor from '../index';
import chunk from 'lodash.chunk';
import { shortTimecode } from '../../util/timecode-converter';

// TODO: import from util
export const generatePreviousTimings = (time) => {
  // https://stackoverflow.com/questions/3746725/how-to-create-an-array-containing-1-n
  return [...Array(parseInt(time)).keys()];
};

const calculateNumberOfHours = (words) => {
  const wordsLength = words.length;
  const wordCountIndex = wordsLength - 1;
  const lastWord = words[wordCountIndex];
  const endTime = lastWord.end;
  const numberOfHours = endTime / 3600; // 1 hour => 3600 sec - 20min => 1200 sec
  // const numberOfHours = endTime / 1200;
  // const numberOfHoursRounded = Math.ceil(numberOfHours);
  const numberOfHoursRounded = Math.round(numberOfHours);
  return numberOfHoursRounded;
};

const divideDpeTranscriptIntoChunks = ({ paragraphs, words }) => {
  const numberOfHoursRounded = calculateNumberOfHours(words);
  const wordsCount = words.length - 1;
  const pages = wordsCount / numberOfHoursRounded;
  const pagesAdjustedForArrayIndex = pages - 1;
  const wordsChunk = chunk(words, pagesAdjustedForArrayIndex);
  return wordsChunk;
};

function chunkParagraphs(wordsChunk, paragaph) {
  return wordsChunk.map((words, i) => {
    const wordsStartTime = words[0].start;
    // TODO: There's an issue. In the splitting between paragraphs.
    // It seems to skip the last paragraph 🤷‍♂️
    const wordsEndTime = words[words.length - 1].end;
    const paragraphs = paragaph.filter((p) => {
      return p.start >= wordsStartTime && p.end <= wordsEndTime;
    });
    const transcript = { words, paragraphs };
    return transcript;
  });
}

const PageWrapper = (props) => {
  const [key, setKey] = useState(0);
  const { transcriptData } = props;
  const wordsChunk = divideDpeTranscriptIntoChunks(transcriptData);
  const transcriptsChunks = chunkParagraphs(wordsChunk, transcriptData.paragraphs);
  const currentChunk = transcriptsChunks[0];
  const [currentTranscriptIndex, setCurrentTranscriptIndex] = useState(0);
  const [currentTranscriptChunk, setCurrentTranscriptChunk] = useState(currentChunk);

  const handleOnSelect = (k) => {
    setKey(k);
    setCurrentTranscriptIndex(parseInt(k));
    const tmp = transcriptsChunks[parseInt(k)];
    setCurrentTranscriptChunk(tmp);
  };

  return (
    <>
      <Tabs id="controlled-tab-example" activeKey={key} onSelect={handleOnSelect}>
        {transcriptsChunks.map((chunk, index) => {
          const startTime = chunk.words[0].start;
          return (
            <Tab eventKey={index} title={shortTimecode(startTime)}>
              {/* This is so that we don't load the editor's for tabs that are not in view */}
              {currentTranscriptIndex === index && (
                <>
                  <SlateTranscriptEditor
                    mediaUrl={props.mediaUrl}
                    transcriptData={chunk}
                    title={props.title}
                    showTitle={props.showTitle}
                    mediaUrl={props.mediaUrl}
                  />
                </>
              )}
            </Tab>
          );
        })}
      </Tabs>
    </>
  );
};

export default PageWrapper;
