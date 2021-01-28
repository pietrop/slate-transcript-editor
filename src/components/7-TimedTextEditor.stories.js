import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { action } from '@storybook/addon-actions';
import { withKnobs, text, boolean, number, object, select } from '@storybook/addon-knobs';
import { withInfo } from '@storybook/addon-info';
import TimedTextEditor from './TimedTextEditor/index.js';

export default {
  title: 'TimedTextEditor',
  component: TimedTextEditor,
  decorators: [withKnobs, withInfo],
  parameters: {
    info: {
      maxPropArrayLength: 3,
      maxPropsIntoLine: 3,
      maxPropObjectKeys: 1,
      //   excludedPropTypes: ['transcriptData'],
      source: false,
    },
  },
};

const DEMO_MEDIA_URL_SOLEIO =
  'https://digital-paper-edit-demo.s3.eu-west-2.amazonaws.com/PBS-Frontline/The+Facebook+Dilemma+-+interviews/The+Facebook+Dilemma+-+Soleio+Cuervo-OIAUfZBd_7w.mp4';
const DEMO_TITLE_SOLEIO = 'Soleio Interview, PBS Frontline';
import DEMO_SOLEIO from '../sample-data/soleio-dpe.json';

// Parent component to simulate results from a live STT stream.
export const TimedTextEditorExample = (props) => {
  return (
    <>
      <TimedTextEditor
        mediaUrl={DEMO_MEDIA_URL_SOLEIO}
        isEditable={true}
        autoSaveContentType={select('autoSaveContentType', ['digitalpaperedit', 'slate'], 'digitalpaperedit')} // digitalpaperedit or slate - digitalpaperedit, runs alignement before exporting, slate, is just the raw data.
        showTimecodes={true}
        showSpeakers={true}
        title={DEMO_TITLE_SOLEIO}
        transcriptData={DEMO_SOLEIO}
        handleSaveEditor={action('handleSaveEditor')}
        showTitle={true}
        currentTime={number('currentTime', 30)}
        //
        isPauseWhileTypingOn={false}
        onWordClick={action('onWordClick')}
        handleAnalyticsEvents={action('handleAnalyticsEvents')}
        getSlateContent={action('handleAnalyticsEvents')}
      />
    </>
  );
};
