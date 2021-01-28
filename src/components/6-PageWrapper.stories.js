import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { action } from '@storybook/addon-actions';
import { withKnobs, text, boolean, number, object, select } from '@storybook/addon-knobs';
import { withInfo } from '@storybook/addon-info';
import PageWrapper from './PageWrapper/index.js';

export default {
  title: 'PageWrapper',
  component: PageWrapper,
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

const DEMO_MEDIA_URL_ZUCK_5HOURS =
  'https://democratic-presidential-debate-stt-analyses.s3.us-east-2.amazonaws.com/Facebook+CEO+Mark+Zuckerberg+FULL+testimony+before+U.S.+senate-pXq-5L2ghhg.mp4';
const DEMO_TITLE_ZUCK_5HOURS = ' 5 Hours | Facebook CEO Mark Zuckerberg  | full testimony before U.S. Senate';
import DEMO_TRANSCRIPT_ZUCK_5HOURS_DPE from '../sample-data/Facebook-CEO-Mark-Zuckerberg-FULL-testimony-before-U.S.senate-pXq-5L2ghhg.mp4.dpe.json';

// Parent component to simulate results from a live STT stream.
export const PageWrapperExample = (props) => {
  return (
    <>
      <PageWrapper
        // mediaUrl={text('mediaUrl', DEMO_MEDIA_URL_SOLEIO)}
        // handleSaveEditor={action('handleSaveEditor')}
        // handleAutoSaveChanges={action('handleAutoSaveChanges')}
        // // https://www.npmjs.com/package/@storybook/addon-knobs#select
        autoSaveContentType={select('autoSaveContentType', ['digitalpaperedit', 'slate'], 'digitalpaperedit')} // digitalpaperedit or slate - digitalpaperedit, runs alignement before exporting, slate, is just the raw data.
        // transcriptDataLive={interimResults}
        isEditable={true}
        showTimecodes={true}
        showSpeakers={true}
        mediaUrl={DEMO_MEDIA_URL_ZUCK_5HOURS}
        title={DEMO_TITLE_ZUCK_5HOURS}
        transcriptData={DEMO_TRANSCRIPT_ZUCK_5HOURS_DPE}
        handleSaveEditor={action('handleSaveEditor')}
        // autoSaveContentType={'digitalpaperedit'}
        showTitle={true}
      />
    </>
  );
};
