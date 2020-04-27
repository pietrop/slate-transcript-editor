import React from 'react';
import { action } from '@storybook/addon-actions';
import SlateTranscriptEditor from './index.js';


export default {
  title: 'SlateTranscriptEditor',
  component: SlateTranscriptEditor,
};

const DEMO_MEDIA_URL_KATE =
  "https://download.ted.com/talks/KateDarling_2018S-950k.mp4";
const DEMO_TITLE_KATE =
  "TED Talk | Kate Darling - Why we have an emotional connection to robots";
import DEMO_TRANSCRIPT_KATE from "../sample-data/KateDarling-dpe.json";
export const TranscriptEditorDemoKate = () => {
return <SlateTranscriptEditor 
  url={DEMO_MEDIA_URL_KATE} 
  title={DEMO_TITLE_KATE} 
  jsonData={DEMO_TRANSCRIPT_KATE}
  handleSaveEditor={action('handleSaveEditor')}
  handleAutoSaveEditor={action('handleAutoSaveEditor')}
  saveFormat={'dpe'} // dpe or slate - dpe, runs alignement before exporting, slate, is just the raw data.
  />
};

export const TranscriptEditorDemoKateNoSpeakers = () => {
  return <SlateTranscriptEditor 
    showTitle={true} // optional - defaults to false
    url={DEMO_MEDIA_URL_KATE} 
    title={DEMO_TITLE_KATE} 
    jsonData={DEMO_TRANSCRIPT_KATE}
    handleSaveEditor={action('handleSaveEditor')}
    handleAutoSaveEditor={action('handleAutoSaveEditor')}
    saveFormat={'dpe'} // dpe or slate - dpe, runs alignement before exporting, slate, is just the raw data.
    showTimecodes={true}
    showSpeakers={false}
    />
  };

  export const TranscriptEditorDemoKateNoTimecodes = () => {
    return <SlateTranscriptEditor 
      url={DEMO_MEDIA_URL_KATE} 
      title={DEMO_TITLE_KATE} 
      jsonData={DEMO_TRANSCRIPT_KATE}
      handleSaveEditor={action('handleSaveEditor')}
      handleAutoSaveEditor={action('handleAutoSaveEditor')}
      saveFormat={'dpe'} // dpe or slate - dpe, runs alignement before exporting, slate, is just the raw data.
      showTimecodes={false}
      showSpeakers={true}
      />
    };

    export const TranscriptEditorDemoKateNoSpeakersAndTimecodes = () => {
      return <SlateTranscriptEditor 
        url={DEMO_MEDIA_URL_KATE} 
        title={DEMO_TITLE_KATE} 
        jsonData={DEMO_TRANSCRIPT_KATE}
        handleSaveEditor={action('handleSaveEditor')}
        handleAutoSaveEditor={action('handleAutoSaveEditor')}
        saveFormat={'dpe'} // dpe or slate - dpe, runs alignement before exporting, slate, is just the raw data.
        showTimecodes={false}
        showSpeakers={false}
        />
      };

const DEMO_MEDIA_URL_ZUCK_5HOURS = "https://democratic-presidential-debate-stt-analyses.s3.us-east-2.amazonaws.com/Facebook+CEO+Mark+Zuckerberg+FULL+testimony+before+U.S.+senate-pXq-5L2ghhg.mp4";

const DEMO_TITLE_ZUCK_2HOURS ="Facebook CEO Mark Zuckerberg | 2 Hours | full testimony before U.S. Senate ";
import DEMO_TRANSCRIPT_ZUCK_2HOURS_DPE from "../sample-data/Facebook-CEO-Mark-Zuckerberg-FULL-testimony-before-U.S.senate-pXq-5L2ghhg.mp4.dpe-2hours.json";
export const TranscriptEditorDemoZuck2Hours = () =>{
  return  <SlateTranscriptEditor 
    url={DEMO_MEDIA_URL_ZUCK_5HOURS} 
    title={DEMO_TITLE_ZUCK_2HOURS} 
    jsonData={DEMO_TRANSCRIPT_ZUCK_2HOURS_DPE}
    handleSaveEditor={action('handleSaveEditor')}
    // handleAutoSaveEditor={action('handleAutoSaveEditor')} // auto save has condierable performance lag on longer files, sudgest to not use for files over 45 min/1hour.
    saveFormat={'dpe'}
    showTitle={true} 
    />
};

const DEMO_TITLE_ZUCK_5HOURS = "Facebook CEO Mark Zuckerberg | 5 Hours | full testimony before U.S. Senate";
import DEMO_TRANSCRIPT_ZUCK_5HOURS_DPE from "../sample-data/Facebook-CEO-Mark-Zuckerberg-FULL-testimony-before-U.S.senate-pXq-5L2ghhg.mp4.dpe.json";
export const TranscriptEditorDemoZuck5Hours = () => {
  return <SlateTranscriptEditor 
    url={DEMO_MEDIA_URL_ZUCK_5HOURS} 
    title={DEMO_TITLE_ZUCK_5HOURS} 
    jsonData={DEMO_TRANSCRIPT_ZUCK_5HOURS_DPE}
    handleSaveEditor={action('handleSaveEditor')}
    // handleAutoSaveEditor={action('handleAutoSaveEditor')}
    saveFormat={'dpe'}
    showTitle={true} 
    />
};


