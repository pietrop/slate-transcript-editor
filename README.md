# Slate transcript editor
<!-- _One liner + link to confluence page_
_Screenshot of UI - optional_ -->

_Work in progress_

Building on the sucess and lessons learned from [`@bbc/react-transcript-editor`](https://github.com/bbc/react-transcript-editor).
Mostly to be used in the context of [autoEdit 3](http://autoedit.io)(digital paper edit), and other proejcts. 

Criterias/Principles
- Easy to reason around
- Can handle transcript and media over 1 hour without loss in performance 
- Only essential features for correction of timed text 
- adapters to and from other STT services, are external, except for dpe (digital paper edit, adapter).
- leverages existing libraries, such as [bootstrap](https://getbootstrap.com/), and [react-bootstrap](https://react-bootstrap.github.io/), to focus on the diffuclt problems, and not wasting time re-inventing the wheel or fiddling around with css.


[See project board for more details](https://github.com/pietrop/slate-transcript-editor/projects/1) of ongoing work.

See [draftJs vs slateJs](/docs/notes/draftJs-vs-slateJs.md) in doc/notes for some considations that inspired this version.

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

_TBC_



<!-- ```
npm install @pietrop/slate-transcript-editor

<SlateTranscriptEditor 
  url={DEMO_MEDIA_URL_KATE} 
  title={DEMO_TITLE_KATE} 
  jsonData={DEMO_TRANSCRIPT_KATE}
  handleSaveEditor={action('handleSaveEditor')}
  handleAutoSaveEditor={action('handleAutoSaveEditor')} // auto save introduces a perfromance cost - not reccomended for transcriptions over 1 hour
  saveFormat={'dpe'} // dpe or slate - dpe, runs alignement before exporting, slate, is just the raw data. Optional, slate default
  showTimecodes={false} // optional - default to true
  showSpeakers={true} // optional  - default to true
  showTitle={true} // optional - defaults to false
  />
```
See storybook -->
 <!-- TODO: link to storybook here --> 
 <!-- for more details on how to use. -->


_see storybook for example code_

## System Architecture
<!-- _High level overview of system architecture_ -->

- Uses [slate](https://slatejs.org) as editor, see their [docs](https://docs.slatejs.org/).
<!-- - takes dpe as input -->
- Uses [`align-diarized-text`](https://github.com/pietrop/align-diarized-text) for restoring timecodes. This lib combined [`stt-align-node`](https://github.com/bbc/stt-align-node) with [`alignment-from-stt`](https://github.com/pietrop/alignment-from-stt) to restore timecodes **and** preserve speaker labels.

- It `align-diarized-text` when export of formats that require timecodes, eg `dpe` json, or `docx` and `txt` with timecodes. Also for the 'realignement'/sync UI btn.
- If you export or save as slate json, at the moment it doesn't run alignement. The function to perform the alignement is also exported by the module, so that you can performe this computational intensive alignement elsewhere if needed, eg server side. 

## Documentation

There's a [docs](./docs) folder in this repository.

- [docs/notes](./docs/notes) contains dev draft notes on various aspects of the project. This would generally be converted either into ADRs or guides when ready.
- [docs/guides](./docs/guides) contains walk through / how to.
- [docs/adr](./docs/adr) contains [Architecture Decision Record](https://github.com/joelparkerhenderson/architecture_decision_record).

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

## Build
<!-- _How to run build_ -->
### build module
_TBC_

### build storybook 
_TBC_

## Tests
<!-- _How to carry out tests_ -->
_TBC_
## Deployment
<!-- _How to deploy the code/app into test/staging/production_ -->

### Deployment module

<!-- ```
npm run publish:public
``` -->
_TBC_
### Deployment storybook

<!-- TODO publish storybook to github pages -->
```
npm run pubslish:storybook
```