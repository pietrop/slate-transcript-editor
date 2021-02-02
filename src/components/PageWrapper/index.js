import React, { useState } from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import TranscriptEditor from '../TranscriptEditor/index';
import { shortTimecode } from '../../util/timecode-converter';

import divideDpeTranscriptIntoChunks from './divide-dpe-transcript-into-chunks';
import chunkParagraphs from './chunk-paragraphs';

const PageWrapper = (props) => {
  const [key, setKey] = useState(0);
  const { transcriptData } = props;
  const wordsChunk = divideDpeTranscriptIntoChunks(transcriptData);
  const transcriptsChunksTmp = chunkParagraphs(wordsChunk, transcriptData.paragraphs);
  const [transcriptsChunks, setTranscriptsChunks] = useState(transcriptsChunksTmp);
  const currentChunk = transcriptsChunks[0];
  const [currentTranscriptIndex, setCurrentTranscriptIndex] = useState(0);
  const [currentTranscriptChunk, setCurrentTranscriptChunk] = useState(currentChunk);

  const handleOnSelect = (k) => {
    setKey(k);
    setCurrentTranscriptIndex(parseInt(k));
    const tmp = transcriptsChunks[parseInt(k)];
    setCurrentTranscriptChunk(tmp);
  };

  const handleSaveEditor = () => {
    console.log('handleSaveEditor');
    // console.log('PageWrapper, handleSaveEditor', data);
    // transcriptsChunks[currentTranscriptIndex] = data;
    // setTranscriptsChunks(transcriptsChunks);
    // setCurrentTranscriptChunk(data);
    // props.handleSaveEditor(data);
  };

  return (
    <>
      <Tabs id="controlled-tab-example" activeKey={key} onSelect={handleOnSelect}>
        {transcriptsChunks.map((chunk, index) => {
          const startTime = chunk.words[0].start;
          // const endTime = chunk.words[chunk.words.length - 1].end;
          return (
            <Tab eventKey={index} title={`${shortTimecode(startTime)}`}>
              {/* This is so that we don't load the editor's for tabs that are not in view */}
              {currentTranscriptIndex === index && (
                <>
                  <TranscriptEditor
                    mediaUrl={props.mediaUrl}
                    transcriptData={chunk}
                    title={props.title}
                    showTitle={props.showTitle}
                    mediaUrl={props.mediaUrl}
                    handleSaveEditor={handleSaveEditor}
                    isEditable={props.isEditable}
                    showTimecodes={props.showTimecodes}
                    showSpeakers={props.showSpeakers}
                    handleAutoSaveChanges={props.handleAutoSaveChanges}
                    autoSaveContentType={props.autoSaveContentType}
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
