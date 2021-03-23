import React from 'react';
import { action } from '@storybook/addon-actions';
import { withKnobs, text, boolean, number, object, select } from '@storybook/addon-knobs';
import { withInfo } from '@storybook/addon-info';
import { version } from '../../package.json';

import Button from '@material-ui/core/Button';
import SlateTranscriptEditor from './index.js';
import 'fontsource-roboto';

export default {
  title: 'SlateTranscriptEditor',
  component: SlateTranscriptEditor,
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
    <>
      <p>
        Slate Transcript Editor version: <code>{version}</code>
      </p>
      <SlateTranscriptEditor
        mediaUrl={text('mediaUrl', DEMO_MEDIA_URL_SOLEIO)}
        handleSaveEditor={action('handleSaveEditor')}
        // handleAutoSaveChanges={action('handleAutoSaveChanges')}
        // https://www.npmjs.com/package/@storybook/addon-knobs#select
        // autoSaveContentType={select('autoSaveContentType', ['digitalpaperedit', 'slate'], 'digitalpaperedit')} // digitalpaperedit or slate - digitalpaperedit, runs alignement before exporting, slate, is just the raw data.
        // transcriptData={object('transcriptData', DEMO_SOLEIO)}
        transcriptData={DEMO_SOLEIO}
      />
    </>
  );
};

export const MinimamlInitialization = () => {
  return (
    <SlateTranscriptEditor
      mediaUrl={text('mediaUrl', DEMO_MEDIA_URL_SOLEIO)}
      transcriptData={DEMO_SOLEIO}
      handleSaveEditor={action('handleSaveEditor')} // optional
    />
  );
};

MinimamlInitialization.story = {
  parameters: {
    info: {}, // mediaUrl: true, transcriptData:true,handleSaveEditor:true
  },
};

export const OptionalTitle = () => {
  return (
    <SlateTranscriptEditor
      showTitle={boolean('showTitle', true)} // optional - defaults to false
      mediaUrl={text('mediaUrl', DEMO_MEDIA_URL_SOLEIO)}
      title={text('title', DEMO_TITLE_SOLEIO)}
      transcriptData={DEMO_SOLEIO}
      handleSaveEditor={action('handleSaveEditor')}
      handleAutoSaveChanges={action('handleAutoSaveChanges')}
      autoSaveContentType={select('autoSaveContentType', ['digitalpaperedit', 'slate'], 'digitalpaperedit')} // digitalpaperedit or slate - digitalpaperedit, runs alignement before exporting, slate, is just the raw data.
      showTimecodes={boolean('timecodes', true)}
      showSpeakers={boolean('speakers', true)}
    />
  );
};

export const NoSpeakers = () => {
  return (
    <SlateTranscriptEditor
      showTitle={boolean('showTitle', false)}
      mediaUrl={text('mediaUrl', DEMO_MEDIA_URL_SOLEIO)}
      title={text('title', DEMO_TITLE_SOLEIO)}
      transcriptData={DEMO_SOLEIO}
      handleSaveEditor={action('handleSaveEditor')}
      handleAutoSaveChanges={action('handleAutoSaveChanges')}
      autoSaveContentType={select('autoSaveContentType', ['digitalpaperedit', 'slate'], 'digitalpaperedit')} // digitalpaperedit or slate - digitalpaperedit, runs alignement before exporting, slate, is just the raw data
      showTimecodes={boolean('timecodes', true)}
      showSpeakers={boolean('speakers', false)}
    />
  );
};

export const NoTimecodes = () => {
  return (
    <SlateTranscriptEditor
      mediaUrl={text('mediaUrl', DEMO_MEDIA_URL_SOLEIO)}
      title={text('title', DEMO_TITLE_SOLEIO)}
      transcriptData={DEMO_SOLEIO}
      handleSaveEditor={action('handleSaveEditor')}
      handleAutoSaveChanges={action('handleAutoSaveChanges')}
      autoSaveContentType={select('autoSaveContentType', ['digitalpaperedit', 'slate'], 'digitalpaperedit')} // digitalpaperedit or slate - digitalpaperedit, runs alignement before exporting, slate, is just the raw data.
      showTimecodes={boolean('timecodes', false)}
      showSpeakers={boolean('speakers', true)}
    />
  );
};

export const NoSpeakersAndTimecodes = () => {
  return (
    <SlateTranscriptEditor
      mediaUrl={text('mediaUrl', DEMO_MEDIA_URL_SOLEIO)}
      title={DEMO_TITLE_SOLEIO}
      transcriptData={DEMO_SOLEIO}
      handleSaveEditor={action('handleSaveEditor')}
      handleAutoSaveChanges={action('handleAutoSaveChanges')}
      autoSaveContentType={select('autoSaveContentType', ['digitalpaperedit', 'slate'], 'digitalpaperedit')} // digitalpaperedit or slate - digitalpaperedit, runs alignement before exporting, slate, is just the raw data.
      showTimecodes={boolean('timecodes', false)}
      showSpeakers={boolean('speakers', false)}
    />
  );
};
export const ReadOnly = () => {
  return (
    <SlateTranscriptEditor
      mediaUrl={text('mediaUrl', DEMO_MEDIA_URL_SOLEIO)}
      title={DEMO_TITLE_SOLEIO}
      transcriptData={DEMO_SOLEIO}
      handleSaveEditor={action('handleSaveEditor')}
      handleAutoSaveChanges={action('handleAutoSaveChanges')}
      autoSaveContentType={select('autoSaveContentType', ['digitalpaperedit', 'slate'], 'digitalpaperedit')} // digitalpaperedit or slate - digitalpaperedit, runs alignement before exporting, slate, is just the raw data.
      isEditable={false}
    />
  );
};

export const Audio = () => {
  return (
    <SlateTranscriptEditor
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

export const optionalAnalytics = () => {
  return (
    <>
      <p>
        Slate Transcript Editor version: <code>{version}</code>
      </p>
      <SlateTranscriptEditor
        mediaUrl={text('mediaUrl', DEMO_MEDIA_URL_SOLEIO)}
        handleSaveEditor={action('handleSaveEditor')}
        // handleAutoSaveChanges={action('handleAutoSaveChanges')}
        // https://www.npmjs.com/package/@storybook/addon-knobs#select
        // autoSaveContentType={select('autoSaveContentType', ['digitalpaperedit', 'slate'], 'digitalpaperedit')} // digitalpaperedit or slate - digitalpaperedit, runs alignement before exporting, slate, is just the raw data.
        // transcriptData={object('transcriptData', DEMO_SOLEIO)}
        transcriptData={DEMO_SOLEIO}
        handleAnalyticsEvents={action('handleAnalyticsEvents')}
      />
    </>
  );
};

export const optionaChildComponents = () => {
  return (
    <>
      <p>
        Slate Transcript Editor version: <code>{version}</code>
      </p>
      <SlateTranscriptEditor
        mediaUrl={text('mediaUrl', DEMO_MEDIA_URL_SOLEIO)}
        handleSaveEditor={action('handleSaveEditor')}
        // handleAutoSaveChanges={action('handleAutoSaveChanges')}
        // https://www.npmjs.com/package/@storybook/addon-knobs#select
        // autoSaveContentType={select('autoSaveContentType', ['digitalpaperedit', 'slate'], 'digitalpaperedit')} // digitalpaperedit or slate - digitalpaperedit, runs alignement before exporting, slate, is just the raw data.
        // transcriptData={object('transcriptData', DEMO_SOLEIO)}
        transcriptData={DEMO_SOLEIO}
        handleAnalyticsEvents={action('handleAnalyticsEvents')}
        optionalBtns={
          <>
            <Button
              title="optional button"
              color="primary"
              onClick={() => {
                alert('optional componet added from outside STE');
              }}
            >
              B
            </Button>
            <Button
              title="optional button"
              color="primary"
              onClick={() => {
                alert('and yes you can add more then one optional componet added from outside STE');
              }}
            >
              O
            </Button>
          </>
        }
      >
        <h1>Optional child component</h1>
      </SlateTranscriptEditor>
    </>
  );
};
