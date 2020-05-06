import React from 'react';
import { action } from '@storybook/addon-actions';
import SlateTranscriptEditor from './index.js';

export default {
  title: 'Performance for over 1 hour media',
  component: SlateTranscriptEditor,
};

const DEMO_MEDIA_URL_ZUCK_5HOURS =
  'https://democratic-presidential-debate-stt-analyses.s3.us-east-2.amazonaws.com/Facebook+CEO+Mark+Zuckerberg+FULL+testimony+before+U.S.+senate-pXq-5L2ghhg.mp4';

const DEMO_TITLE_ZUCK_2HOURS = ' 2 Hours |Facebook CEO Mark Zuckerberg | full testimony before U.S. Senate ';
import DEMO_TRANSCRIPT_ZUCK_2HOURS_DPE from '../sample-data/Facebook-CEO-Mark-Zuckerberg-FULL-testimony-before-U.S.senate-pXq-5L2ghhg.mp4.dpe-2hours.json';
export const Hours2 = () => {
  return (
    <SlateTranscriptEditor
      mediaUrl={DEMO_MEDIA_URL_ZUCK_5HOURS}
      title={DEMO_TITLE_ZUCK_2HOURS}
      transcriptData={DEMO_TRANSCRIPT_ZUCK_2HOURS_DPE}
      handleSaveEditor={action('handleSaveEditor')}
      autoSaveContentType={'digitalpaperedit'}
      showTitle={true}
    />
  );
};

const DEMO_TITLE_ZUCK_5HOURS = ' 5 Hours | Facebook CEO Mark Zuckerberg  | full testimony before U.S. Senate';
import DEMO_TRANSCRIPT_ZUCK_5HOURS_DPE from '../sample-data/Facebook-CEO-Mark-Zuckerberg-FULL-testimony-before-U.S.senate-pXq-5L2ghhg.mp4.dpe.json';
export const Hours5 = () => {
  return (
    <SlateTranscriptEditor
      mediaUrl={DEMO_MEDIA_URL_ZUCK_5HOURS}
      title={DEMO_TITLE_ZUCK_5HOURS}
      transcriptData={DEMO_TRANSCRIPT_ZUCK_5HOURS_DPE}
      handleSaveEditor={action('handleSaveEditor')}
      autoSaveContentType={'digitalpaperedit'}
      showTitle={true}
    />
  );
};

// TODO: 5 hours with auto save, to troubleshoot performance snag, and optimise auto save logic
// export const Hours5WithAutoSave = () => {
//   return <SlateTranscriptEditor
//     mediaUrl={DEMO_MEDIA_URL_ZUCK_5HOURS}
//     title={DEMO_TITLE_ZUCK_5HOURS}
//     transcriptData={DEMO_TRANSCRIPT_ZUCK_5HOURS_DPE}
//     handleSaveEditor={action('handleSaveEditor')}
//     autoSaveContentType={'digitalpaperedit'}
//     handleAutoSaveChanges={action('handleAutoSaveChanges')}
//     showTitle={true}
//     />
// };
