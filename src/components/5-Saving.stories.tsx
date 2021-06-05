import React, { ComponentProps } from 'react';
import { action } from '@storybook/addon-actions';
import { version } from '../../package.json';

import SlateTranscriptEditor from '.';
import 'fontsource-roboto';

export default {
  title: 'Saving indicator',
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

const DEMO_MEDIA_URL_SOLEIO =
  'https://digital-paper-edit-demo.s3.eu-west-2.amazonaws.com/PBS-Frontline/The+Facebook+Dilemma+-+interviews/The+Facebook+Dilemma+-+Soleio+Cuervo-OIAUfZBd_7w.mp4';
const DEMO_TITLE_SOLEIO = 'Soleio Interview, PBS Frontline';
import DEMO_SOLEIO from '../sample-data/soleio-dpe.json';
import { Story } from '@storybook/react';

export const NoAutoSave = Template.bind({});
NoAutoSave.args = {
  title: DEMO_TITLE_SOLEIO,
  mediaUrl: DEMO_MEDIA_URL_SOLEIO,
  handleSaveEditor: action('handleSaveEditor'),
  autoSaveContentType: 'digitalpaperedit', // digitalpaperedit or slate - digitalpaperedit, runs alignement before exporting, slate, is just the raw data.
  transcriptData: DEMO_SOLEIO,
};

export const AutoSave = Template.bind({});
AutoSave.args = {
  title: DEMO_TITLE_SOLEIO,
  mediaUrl: DEMO_MEDIA_URL_SOLEIO,
  handleSaveEditor: action('handleSaveEditor'),
  handleAutoSaveChanges: action('handleAutoSaveChanges'),
  autoSaveContentType: 'digitalpaperedit', // digitalpaperedit or slate - digitalpaperedit, runs alignement before exporting, slate, is just the raw data.
  transcriptData: DEMO_SOLEIO,
};
