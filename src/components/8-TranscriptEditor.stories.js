import React from 'react';
import { action } from '@storybook/addon-actions';
import { withKnobs, text, boolean, number, object, select } from '@storybook/addon-knobs';
import { withInfo } from '@storybook/addon-info';

import TranscriptEditor from './TranscriptEditor';

export default {
  title: 'TranscriptEditor',
  component: TranscriptEditor,
  decorators: [withKnobs, withInfo],
  parameters: {
    info: {
      maxPropArrayLength: 3,
      maxPropsIntoLine: 3,
      maxPropObjectKeys: 1,
      excludedPropTypes: ['transcriptData'],
      source: false,
    },
  },
};

const AUDIO_URL = 'https://www.w3schools.com/tags/horse.ogg';

const DEMO_MEDIA_URL_KATE = 'https://download.ted.com/talks/KateDarling_2018S-950k.mp4';
const DEMO_TITLE_KATE = 'TED Talk | Kate Darling - Why we have an emotional connection to robots';
import DEMO_TRANSCRIPT_KATE from '../sample-data/KateDarling-dpe.json';

const DEMO_MEDIA_URL_SOLEIO =
  'https://digital-paper-edit-demo.s3.eu-west-2.amazonaws.com/PBS-Frontline/The+Facebook+Dilemma+-+interviews/The+Facebook+Dilemma+-+Soleio+Cuervo-OIAUfZBd_7w.mp4';
const DEMO_TITLE_SOLEIO = 'Soleio Interview, PBS Frontline';
import DEMO_SOLEIO from '../sample-data/soleio-dpe.json';
export const demo = () => {
  return (
    <TranscriptEditor
      mediaUrl={text('mediaUrl', DEMO_MEDIA_URL_SOLEIO)}
      handleSaveEditor={action('handleSaveEditor')}
      handleAutoSaveChanges={action('handleAutoSaveChanges')}
      // https://www.npmjs.com/package/@storybook/addon-knobs#select
      autoSaveContentType={select('autoSaveContentType', ['digitalpaperedit'], 'digitalpaperedit')} // digitalpaperedit or slate - digitalpaperedit, runs alignement before exporting, slate, is just the raw data.
      // transcriptData={object('transcriptData', DEMO_SOLEIO)}
      transcriptData={DEMO_SOLEIO}
      showTitle={boolean('showTitle', true)} // optional - defaults to false
      title={text('title', DEMO_TITLE_SOLEIO)}
      showTimecodes={boolean('timecodes', true)}
      showSpeakers={boolean('speakers', true)}
      isEditable={boolean('isEditable', true)}
    />
  );
};

// const AUDIO_URL = 'https://www.w3schools.com/tags/horse.ogg';
export const Audio = () => {
  return (
    <TranscriptEditor
      mediaUrl={text('mediaUrl', AUDIO_URL)}
      transcriptData={DEMO_SOLEIO}
      handleSaveEditor={action('handleSaveEditor')}
      handleAutoSaveChanges={action('handleAutoSaveChanges')}
      autoSaveContentType={select('autoSaveContentType', ['digitalpaperedit', 'slate'], 'digitalpaperedit')} // digitalpaperedit or slate - digitalpaperedit, runs alignement before exporting, slate, is just the raw data.
      isEditable={true}
      mediaType={select('mediaType', ['audio', 'video'], 'audio')}
    />
  );
};

const DEMO_MEDIA_URL_ZUCK_5HOURS =
  'https://democratic-presidential-debate-stt-analyses.s3.us-east-2.amazonaws.com/Facebook+CEO+Mark+Zuckerberg+FULL+testimony+before+U.S.+senate-pXq-5L2ghhg.mp4';
const DEMO_TITLE_ZUCK_5HOURS = ' 5 Hours | Facebook CEO Mark Zuckerberg  | full testimony before U.S. Senate';
import DEMO_TRANSCRIPT_ZUCK_5HOURS_DPE from '../sample-data/Facebook-CEO-Mark-Zuckerberg-FULL-testimony-before-U.S.senate-pXq-5L2ghhg.mp4.dpe.json';

// Parent component to simulate results from a live STT stream.
export const hours5Example = (props) => {
  return (
    <>
      <TranscriptEditor
        handleAutoSaveChanges={action('handleAutoSaveChanges')}
        // // https://www.npmjs.com/package/@storybook/addon-knobs#select
        autoSaveContentType={select('autoSaveContentType', ['digitalpaperedit'], 'digitalpaperedit')} // digitalpaperedit or slate - digitalpaperedit, runs alignement before exporting, slate, is just the raw data.
        //
        mediaUrl={text('mediaUrl', DEMO_MEDIA_URL_ZUCK_5HOURS)}
        handleSaveEditor={action('handleSaveEditor')}
        // handleAutoSaveChanges={action('handleAutoSaveChanges')}
        // https://www.npmjs.com/package/@storybook/addon-knobs#select
        transcriptData={DEMO_TRANSCRIPT_ZUCK_5HOURS_DPE}
        showTitle={boolean('showTitle', true)} // optional - defaults to false
        title={text('title', DEMO_TITLE_ZUCK_5HOURS)}
        showTimecodes={boolean('timecodes', true)}
        showSpeakers={boolean('speakers', true)}
        isEditable={boolean('isEditable', true)}
      />
    </>
  );
};
