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
      autoSaveContentType={select('autoSaveContentType', ['digitalpaperedit', 'slate'], 'digitalpaperedit')} // digitalpaperedit or slate - digitalpaperedit, runs alignement before exporting, slate, is just the raw data.
      // transcriptData={object('transcriptData', DEMO_SOLEIO)}
      transcriptData={DEMO_SOLEIO}
    />
  );
};
