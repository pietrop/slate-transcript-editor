import { deepOrange, lightBlue, orange, red } from '@material-ui/core/colors';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { action } from '@storybook/addon-actions';
import 'fontsource-roboto';
import React from 'react';
// import purple from '@material-ui/core/colors/purple';
import SlateTranscriptEditor from '.';
import { version } from '../../package.json';
import DEMO_SOLEIO from '../sample-data/soleio-dpe.json';

export default {
  title: 'Custom Theme',
  component: SlateTranscriptEditor,
};

const DEMO_MEDIA_URL_SOLEIO =
  'https://digital-paper-edit-demo.s3.eu-west-2.amazonaws.com/PBS-Frontline/The+Facebook+Dilemma+-+interviews/The+Facebook+Dilemma+-+Soleio+Cuervo-OIAUfZBd_7w.mp4';
const DEMO_TITLE_SOLEIO = 'Soleio Interview, PBS Frontline';

export const CustomTheme = () => {
  const theme = createMuiTheme({
    palette: {
      background: {
        // paper: '#424242',
        // default: '#303030',
      },
      primary: {
        main: lightBlue['500'],
      },
      secondary: {
        main: red['500'],
      },
    },
  });
  return (
    <>
      <p>
        Slate Transcript Editor version: <code>{version}</code>
      </p>
      <ThemeProvider theme={theme}>
        <SlateTranscriptEditor
          title={DEMO_TITLE_SOLEIO}
          mediaUrl={DEMO_MEDIA_URL_SOLEIO}
          handleSaveEditor={action('handleSaveEditor')}
          // handleAutoSaveChanges={action('handleAutoSaveChanges')}
          // https://www.npmjs.com/package/@storybook/addon-knobs#select
          autoSaveContentType={'digitalpaperedit'} // digitalpaperedit or slate - digitalpaperedit, runs alignement before exporting, slate, is just the raw data.
          // transcriptData={object('transcriptData', DEMO_SOLEIO)}
          transcriptData={DEMO_SOLEIO}
        />
      </ThemeProvider>
    </>
  );
};

export const CustomThemeExampleTwo = () => {
  const theme = createMuiTheme({
    palette: {
      background: {
        // paper: '#424242',
        // default: '#303030',
      },
      primary: {
        main: deepOrange['900'],
      },
      secondary: {
        main: orange['900'],
      },
    },
  });
  return (
    <>
      <p>
        Slate Transcript Editor version: <code>{version}</code>
      </p>
      <ThemeProvider theme={theme}>
        <SlateTranscriptEditor
          title={DEMO_TITLE_SOLEIO}
          mediaUrl={DEMO_MEDIA_URL_SOLEIO}
          handleSaveEditor={action('handleSaveEditor')}
          // handleAutoSaveChanges={action('handleAutoSaveChanges')}
          // https://www.npmjs.com/package/@storybook/addon-knobs#select
          autoSaveContentType={'digitalpaperedit'} // digitalpaperedit or slate - digitalpaperedit, runs alignement before exporting, slate, is just the raw data.
          // transcriptData={object('transcriptData', DEMO_SOLEIO)}
          transcriptData={DEMO_SOLEIO}
        />
      </ThemeProvider>
    </>
  );
};
