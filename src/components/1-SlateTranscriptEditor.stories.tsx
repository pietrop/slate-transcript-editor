import React, { ComponentProps, PropsWithChildren } from 'react';
import { action } from '@storybook/addon-actions';
import { Story } from '@storybook/react';

import Button from '@material-ui/core/Button';
import SlateTranscriptEditor, { Props as SlateTranscriptEditorProps } from '.';
import 'fontsource-roboto';

export default {
  title: 'SlateTranscriptEditor',
  component: SlateTranscriptEditor,
  argTypes: {
    autoSaveContentType: {
      options: ['digitalpaperedit', 'slate'],
      control: { type: 'radio' },
    },
    mediaType: {
      options: ['audio', 'video'],
      control: { type: 'radio' },
    },
  },
};

const Template: Story<ComponentProps<typeof SlateTranscriptEditor>> = (args) => <SlateTranscriptEditor {...args} />;

const AUDIO_URL = 'https://www.w3schools.com/tags/horse.ogg';

// const DEMO_MEDIA_URL_KATE = 'https://download.ted.com/talks/KateDarling_2018S-950k.mp4';
// const DEMO_TITLE_KATE = 'TED Talk | Kate Darling - Why we have an emotional connection to robots';
// import DEMO_TRANSCRIPT_KATE from '../sample-data/KateDarling-dpe.json';

const DEMO_MEDIA_URL_SOLEIO =
  'https://digital-paper-edit-demo.s3.eu-west-2.amazonaws.com/PBS-Frontline/The+Facebook+Dilemma+-+interviews/The+Facebook+Dilemma+-+Soleio+Cuervo-OIAUfZBd_7w.mp4';
const DEMO_TITLE_SOLEIO = 'Soleio Interview, PBS Frontline';
import DEMO_SOLEIO from '../sample-data/soleio-dpe.json';

export const demo = Template.bind({});
demo.args = {
  mediaUrl: DEMO_MEDIA_URL_SOLEIO,
  handleSaveEditor: action('handleSaveEditor'),
  transcriptData: DEMO_SOLEIO,
};

export const MinimalInitialisation = Template.bind({});
MinimalInitialisation.args = {
  mediaUrl: DEMO_MEDIA_URL_SOLEIO,
  handleSaveEditor: action('handleSaveEditor'),
  transcriptData: DEMO_SOLEIO,
};

export const OptionalTitle = Template.bind({});
OptionalTitle.args = {
  showTitle: true,
  mediaUrl: DEMO_MEDIA_URL_SOLEIO,
  transcriptData: DEMO_SOLEIO,
  title: DEMO_TITLE_SOLEIO,
  handleSaveEditor: action('handleSaveEditor'),
  handleAutoSaveChanges: action('handleAutoSaveChanges'),
  autoSaveContentType: 'digitalpaperedit',
  showTimecodes: true,
  showSpeakers: true,
};

export const NoSpeakers = Template.bind({});
NoSpeakers.args = {
  showTitle: false,
  mediaUrl: DEMO_MEDIA_URL_SOLEIO,
  title: DEMO_TITLE_SOLEIO,
  transcriptData: DEMO_SOLEIO,
  handleSaveEditor: action('handleSaveEditor'),
  handleAutoSaveChanges: action('handleAutoSaveChanges'),
  autoSaveContentType: 'digitalpaperedit',
  showTimecodes: true,
  showSpeakers: false,
};

export const NoTimecodes = Template.bind({});
NoTimecodes.args = {
  mediaUrl: DEMO_MEDIA_URL_SOLEIO,
  title: DEMO_TITLE_SOLEIO,
  transcriptData: DEMO_SOLEIO,
  handleSaveEditor: action('handleSaveEditor'),
  handleAutoSaveChanges: action('handleAutoSaveChanges'),
  autoSaveContentType: 'digitalpaperedit',
  showTimecodes: false,
  showSpeakers: true,
};

export const NoSpeakersAndTimecodes = Template.bind({});
NoSpeakersAndTimecodes.args = {
  mediaUrl: DEMO_MEDIA_URL_SOLEIO,
  title: DEMO_TITLE_SOLEIO,
  transcriptData: DEMO_SOLEIO,
  handleSaveEditor: action('handleSaveEditor'),
  handleAutoSaveChanges: action('handleAutoSaveChanges'),
  autoSaveContentType: 'digitalpaperedit',
  showTimecodes: false,
  showSpeakers: false,
};

export const ReadOnly = Template.bind({});
ReadOnly.args = {
  mediaUrl: DEMO_MEDIA_URL_SOLEIO,
  title: DEMO_TITLE_SOLEIO,
  transcriptData: DEMO_SOLEIO,
  handleSaveEditor: action('handleSaveEditor'),
  handleAutoSaveChanges: action('handleAutoSaveChanges'),
  autoSaveContentType: 'digitalpaperedit',
  isEditable: false,
};

export const Audio = Template.bind({});
Audio.args = {
  mediaUrl: AUDIO_URL,
  transcriptData: DEMO_SOLEIO,
  handleSaveEditor: action('handleSaveEditor'),
  handleAutoSaveChanges: action('handleAutoSaveChanges'),
  autoSaveContentType: 'digitalpaperedit',
  isEditable: true,
  mediaType: 'audio',
};

export const OptionalAnalytics = Template.bind({});
OptionalAnalytics.args = {
  mediaUrl: DEMO_MEDIA_URL_SOLEIO,
  handleSaveEditor: action('handleSaveEditor'),
  handleAutoSaveChanges: action('handleAutoSaveChanges'),
  autoSaveContentType: 'digitalpaperedit',
  transcriptData: DEMO_SOLEIO,
  handleAnalyticsEvents: action('handleAnalyticsEvents'),
};

export const OptionalChildComponents = Template.bind({});
OptionalChildComponents.args = {
  mediaUrl: DEMO_MEDIA_URL_SOLEIO,
  handleSaveEditor: action('handleSaveEditor'),
  handleAutoSaveChanges: action('handleAutoSaveChanges'),
  autoSaveContentType: 'digitalpaperedit',
  transcriptData: DEMO_SOLEIO,
  handleAnalyticsEvents: action('handleAnalyticsEvents'),
  optionalBtns: (
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
  ),
  children: <h1>Optional child component</h1>,
};
