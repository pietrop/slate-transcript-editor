# Slate transcript editor

<!-- _One liner + link to confluence page_
_Screenshot of UI - optional_ -->

_Work in progress_

Building on the success and lessons learned from [`@bbc/react-transcript-editor`](https://github.com/bbc/react-transcript-editor).
Mostly to be used in the context of [autoEdit 3](http://autoedit.io)(digital paper edit), and other proejcts.

Criterias/Principles

- Easy to reason around
- Can handle transcript and media over 1 hour without loss in performance
- Only essential features for correction of timed text
- adapters to and from other STT services, are external, except for dpe (digital paper edit, adapter).
- leverages existing libraries, such as [Material UI](https://material-ui.com), to focus on the diffuclt problems, and not wasting time re-inventing the wheel or fiddling around with css.

[See project board for more details](https://github.com/pietrop/slate-transcript-editor/projects/1) of ongoing work.

See [draftJs vs slateJs](/docs/notes/draftJs-vs-slateJs.md) in doc/notes for some considerations that inspired this version.

[Storybook](https://pietropassarelli.com/slate-transcript-editor)

## Setup

<!-- _stack - optional_
_How to build and run the code/app_ -->

```
git clone git@github.com:pietrop/slate-transcript-editor.git
```

```
cd slate-transcript-editor
```

```
npm install
```

## Usage

### Usage - dev

```
npm run storybook
```

or

```
npm start
```

Visit [http://localhost:6006/](http://localhost:6006/)

### Usage - prod

[slate-transcript-editor](https://www.npmjs.com/package/slate-transcript-editor)

```
npm install slate-transcript-editor
```

```js
import  SlateTranscriptEditor  from 'slate-transcript-editor';

<SlateTranscriptEditor
  mediaUrl={DEMO_MEDIA_URL}
  transcriptData={DEMO_TRANSCRIPT}
  handleSaveEditor=// optional - function to handle when user clicks save btn in the UI
  />
```

or with more options, see table below

See storybook `*.stories.js` in `src/components`/ for more examples

| Attributes              | Description                                                                                                                                                                                                     | required |   type   |
| :---------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | :------: |
| transcriptData          | Transcript json                                                                                                                                                                                                 |   yes    |   Json   |
| mediaUrl                | string url to media file - audio or video                                                                                                                                                                       |   yes    |  String  |
| `handleSaveEditor`      | function to handle when user clicks save btn in the UI                                                                                                                                                          |    no    | Function |
| `handleAutoSaveChanges` | returns content of transcription after there's a change, auto save has condierable performance lag on longer files, sudgest to not use for files over 45 min/1hour.                                             |    no    | Function |
| `autoSaveContentType`   | specify the file format for data returned by `handleAutoSaveChanges` and `handleSaveEditor`,falls default to `digitalpaperedit`, and runs alignement before export. Other option is `slate`,without alignement. |    no    |  String  |
| `isEditable`            | set to true if you want to be able to edit the text                                                                                                                                                             |    no    | Boolean  |
| `showTimecodes`         | set to true if you want to show timecodes in the transcript at paragraph level                                                                                                                                  |    no    | Boolean  |
| `showSpeakers`          | set to true if you want to show speaker labels in the transcript at paragraph level                                                                                                                             |    no    | Boolean  |
| `title`                 | defaults to empty String, also used in file names for exported files.                                                                                                                                           |    no    |  String  |
| `showTitle`             | Whether to display the provided title                                                                                                                                                                           |    no    |  String  |
| `handleAnalyticsEvents` | optional function to log analytics, returns event name as string, and some data as object associated with that event, see storybook for example                                                                 |    no    | Function |
| `optionalBtns`          | optional buttons or react components can be passed to the sidebar see storybook for example                                                                                                                     |    no    |   Jsx    |

 <!-- TODO: link to storybook here -->
 <!-- for more details on how to use. -->

_see storybook for example code_

#### Adapters

- [`assemblyai-to-dpe`](https://github.com/pietrop/assemblyai-to-dpe)
- [`gcp-to-dpe`](https://github.com/pietrop/gcp-to-dpe)
- [`aws-to-dpe`](https://github.com/pietrop/aws-to-dpe)
- [`deepspeech-node-wrapper`](https://github.com/pietrop/deepspeech-node-wrapper)
- [`pocketsphinx-stt`](https://github.com/pietrop/pocketsphinx-stt)
- [`speechmatics-to-dpe`](https://github.com/pietrop/digital-paper-edit-electron/tree/master/src/ElectronWrapper/lib/transcriber/speechmatics/speechmatics-to-dpe)
- [`ibmwatson-to-dpe`](https://github.com/pietrop/digital-paper-edit-electron/tree/8ee0904951a0074bb1cd3e10e77d78ad7cc2c9d5/src/ElectronWrapper/lib/transcriber/ibmwatson/ibmwatson-to-dpe)

<!-- _If yu want to contribute to the individual adapters, checkout their own individual repos_ -->

<!-- _If you have many a dpe adapter module for another service not listed here, feel free to do a PR to add it to the README_ -->

## System Architecture

<!-- _High level overview of system architecture_ -->

- Uses [slate](https://slatejs.org) as editor, see their [docs](https://docs.slatejs.org/).
  <!-- - takes dpe as input -->
- Uses [`stt-align-node`](https://github.com/bbc/stt-align-node) for restoring timecodes.

- It re-syncs the timecodes when export of formats that require timecodes, eg `dpe` json, or `docx` and `txt` with timecodes. Also for the 'realignement'/sync UI btn.
- If you export or save as slate json, at the moment it doesn't run alignement. The function to perform the alignement is also exported by the module, so that you can performe this computational intensive alignement elsewhere if needed, eg server side.

### Customizing look and feel

The project uses [material-ui](https://material-ui.com). The style of the components is therefore self contained and does not reequire any additional stylesheet.

#### Theming

You can use [material-ui](https://material-ui.com)'s [Theming](https://material-ui.com/customization/theming/#theming) and [colors](https://material-ui.com/customization/color/#color)

##### Examples

<details>
  <summary> Theming a whole CRA app</summary>

```js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
// Material UI Theme provider
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
// You can use material UI color design tokens, your own or color hex value
import { blue, indigo, green, purple } from '@material-ui/core/colors';

import 'fontsource-roboto';
// customize yout theme as much or as little as you want
const theme = createMuiTheme({
  palette: {
    background: {
      // paper: '#424242',
      // default: '#303030',
    },
    primary: {
      main: purple,
    },
    secondary: {
      main: green,
    },
  },
});

ReactDOM.render(
  <>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </>,
  document.getElementById('root')
);
```

</details>

<details>
  <summary> Theming only the Slate Transcript Editor, in a parent component</summary>

```js
import React from 'react';
// Material UI Theme provider
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
// You can use material UI color design tokens, your own or color hex value
import { blue, indigo, green, purple } from '@material-ui/core/colors';
// optional fonts
import 'fontsource-roboto';
// customize yout theme as much or as little as you want
const theme = createMuiTheme({
  palette: {
    background: {
      // paper: '#424242',
      // default: '#303030',
    },
    primary: {
      main: purple,
    },
    secondary: {
      main: green,
    },
  },
});

function TranscriptPage(props) {
  // some state and functions handlers for `TranscriptEditor`
  // eg `handleSave`

  const handleSave = (data) => {
    // Do something with the data eg save
  };

  return (
    <ThemeProvider theme={theme}>
      <TranscriptEditor
        transcriptData={transcriptJson} // Transcript json
        mediaUrl={url} // string url to media file - audio
        handleSaveEditor={handleSave} // optional - function to handle when user clicks save btn in the UI
      />
    </ThemeProvider>
  );
}

export default TranscriptPage;
```

</details>

## Documentation

There's a [docs](./docs) folder in this repository.

- [docs/notes](./docs/notes) contains dev draft notes on various aspects of the project. This would generally be converted either into ADRs or guides when ready.
- [docs/guides](./docs/guides) contains walk through / how to.
- [docs/adr](./docs/adr) contains [Architecture Decision Record](https://github.com/joelparkerhenderson/architecture_decision_record).

The [docs folder syncs with gitbook](https://docs.gitbook.com/integrations/github/content-configuration#root) to make the documentation more pleasent to browse at [autoedit.gitbook.io/slate-transcript-editor-docs/](https://autoedit.gitbook.io/slate-transcript-editor-docs/) - _Work in progress_

The `doc` folder syncs with gitbook for ease of browsing at [gitbook `slate-transcript-editor-docs`](https://autoedit.gitbook.io/slate-transcript-editor-docs/)

<!-- > An architectural decision record (ADR) is a document that captures an important architectural decision made along with its context and consequences.

We are using [this template for ADR](https://gist.github.com/iaincollins/92923cc2c309c2751aea6f1b34b31d95) -->

## Development env

 <!-- _How to run the development environment_
_Coding style convention ref optional, eg which linter to use_
_Linting, github pre-push hook - optional_ -->

- npm `6.13.6`
- node `12`
- storybook

If you have nvm you can run `nvm use` to change to the node version for this repo.

### Linting

This repo uses prettier for linting. If you are using visual code you can add the [Prettier - Code formatter](https://github.com/prettier/prettier-vscode) extension, and configure visual code to do things like [format on save](https://stackoverflow.com/questions/39494277/how-do-you-format-code-on-save-in-vs-code).

You can also run the linting via npm scripts

```
npm run lint
```

and there's also a [pre-commit hook](https://github.com/typicode/husky) that runs it too.

## Build

<!-- _How to run build_ -->

### build module

Following storybook [Distribute UI across an organization](https://www.learnstorybook.com/design-systems-for-developers/react/en/distribute/) guide.

### build storybook

```
nvm use 12
```

```
npm run build-storybook
```

## Tests

<!-- _How to carry out tests_ -->

```
nvm use 14
```

```
npm run test
```

🚧 Wok in progress 🚧

(_for now only localized to CSV composer module - and not fully working_)

## Deployment

<!-- _How to deploy the code/app into test/staging/production_ -->

### Deployment module

To publish module to npm

```
npm run publish:public
```

and for a test run use

```
npm run publish:dry:run
```

### Deployment storybook

To publish storybook to github pages

```
npm run deploy:ghpages
```
