import React from 'react';
import { action } from '@storybook/addon-actions';
import SlateTranscriptEditor from './index.js';
import 'bootstrap-css-only';

export default {
  title: 'SlateTranscriptEditor',
  component: SlateTranscriptEditor,
};

const DEMO_MEDIA_URL_KATE =
  "https://download.ted.com/talks/KateDarling_2018S-950k.mp4";
const DEMO_TITLE_KATE =
  "TED Talk | Kate Darling - Why we have an emotional connection to robots";
import DEMO_TRANSCRIPT_KATE from "../sample-data/KateDarling-dpe.json";
export const demo = () => {
return <SlateTranscriptEditor 
// showTitle={true} // optional - defaults to false
  mediaUrl={DEMO_MEDIA_URL_KATE} 
  // title={DEMO_TITLE_KATE} 
  transcriptData={DEMO_TRANSCRIPT_KATE}
  handleSaveEditor={action('handleSaveEditor')}
  handleAutoSaveChanges={action('handleAutoSaveChanges')}
  autoSaveContentType={'dpe'} // dpe or slate - dpe, runs alignement before exporting, slate, is just the raw data.
  />
};

export const MinimamlInitialization = () => {
  return <SlateTranscriptEditor 
    mediaUrl={DEMO_MEDIA_URL_KATE} 
    transcriptData={DEMO_TRANSCRIPT_KATE}
    handleSaveEditor={action('handleSaveEditor')} // optional
    />
  };

export const OptionalTitle = () => {
  return <SlateTranscriptEditor 
    showTitle={true} // optional - defaults to false
    mediaUrl={DEMO_MEDIA_URL_KATE} 
    title={DEMO_TITLE_KATE} 
    transcriptData={DEMO_TRANSCRIPT_KATE}
    handleSaveEditor={action('handleSaveEditor')}
    handleAutoSaveChanges={action('handleAutoSaveChanges')}
    autoSaveContentType={'dpe'} // dpe or slate - dpe, runs alignement before exporting, slate, is just the raw data.
    showTimecodes={true}
    showSpeakers={false}
    />
  };

export const NoSpeakers = () => {
  return <SlateTranscriptEditor 
    mediaUrl={DEMO_MEDIA_URL_KATE} 
    title={DEMO_TITLE_KATE} 
    transcriptData={DEMO_TRANSCRIPT_KATE}
    handleSaveEditor={action('handleSaveEditor')}
    handleAutoSaveChanges={action('handleAutoSaveChanges')}
    autoSaveContentType={'dpe'} // dpe or slate - dpe, runs alignement before exporting, slate, is just the raw data.
    showTimecodes={true}
    showSpeakers={false}
    />
  };

  export const NoTimecodes = () => {
    return <SlateTranscriptEditor 
      mediaUrl={DEMO_MEDIA_URL_KATE} 
      title={DEMO_TITLE_KATE} 
      transcriptData={DEMO_TRANSCRIPT_KATE}
      handleSaveEditor={action('handleSaveEditor')}
      handleAutoSaveChanges={action('handleAutoSaveChanges')}
      autoSaveContentType={'dpe'} // dpe or slate - dpe, runs alignement before exporting, slate, is just the raw data.
      showTimecodes={false}
      showSpeakers={true}
      />
    };

    export const NoSpeakersAndTimecodes = () => {
      return <SlateTranscriptEditor 
        mediaUrl={DEMO_MEDIA_URL_KATE} 
        title={DEMO_TITLE_KATE} 
        transcriptData={DEMO_TRANSCRIPT_KATE}
        handleSaveEditor={action('handleSaveEditor')}
        handleAutoSaveChanges={action('handleAutoSaveChanges')}
        autoSaveContentType={'dpe'} // dpe or slate - dpe, runs alignement before exporting, slate, is just the raw data.
        showTimecodes={false}
        showSpeakers={false}
        />
      };
      export const ReadOnly = () => {
        return <SlateTranscriptEditor 
          mediaUrl={DEMO_MEDIA_URL_KATE} 
          title={DEMO_TITLE_KATE} 
          transcriptData={DEMO_TRANSCRIPT_KATE}
          handleSaveEditor={action('handleSaveEditor')}
          handleAutoSaveChanges={action('handleAutoSaveChanges')}
          autoSaveContentType={'dpe'} // dpe or slate - dpe, runs alignement before exporting, slate, is just the raw data.
          isEditable={false}
          />
        };
  
        export const Audio = () => {
          return <SlateTranscriptEditor 
            mediaUrl={'https://www.w3schools.com/tags/horse.ogg'} 
            // title={DEMO_TITLE_KATE} 
            transcriptData={DEMO_TRANSCRIPT_KATE}
            handleSaveEditor={action('handleSaveEditor')}
            handleAutoSaveChanges={action('handleAutoSaveChanges')}
            autoSaveContentType={'dpe'} // dpe or slate - dpe, runs alignement before exporting, slate, is just the raw data.
            isEditable={true}
            mediaType={'audio'}
            />
          };
      

   