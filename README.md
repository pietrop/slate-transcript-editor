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


```js
npm install slate-transcript-editor
// you need to import bootstrap separatly 
import 'bootstrap-css-only';

<SlateTranscriptEditor 
  mediaUrl={DEMO_MEDIA_URL_KATE} 
  transcriptData={DEMO_TRANSCRIPT_KATE}
  handleSaveEditor=// optional - function to handle when user clicks save btn in the UI
  />
```
or with more options, see table below 

See storybook `*.stories.js` in `src/components`/ for more examples 


| Attributes            | Description                                                                                        |required|type|
| :-------------------- | :--------------------------------------------------------------------------------------------------| :---: | :---: |
| transcriptData        | Transcript json                                                                                     |yes|Json|
| mediaUrl              | string url to media file - audio or video                                                           |yes|String|
|`handleSaveEditor`     |function to handle when user clicks save btn in the UI                                               |no|Function|
|`handleAutoSaveChanges`| returns content of transcription after a change                                                     |no|Function|
| `autoSaveContentType` | specify the file format for data returned by `handleAutoSaveChanges`,falls back on `slate`. or `dpe`|no|String  |
| `isEditable`          | set to true if you want to be able to edit the text                                                 |no|Boolean |
| `showTimecodes`       | set to true if you want to show timecodes in the  transcript at paragraph level                     |no|Boolean |
| `showSpeakers`        | set to true if you want to show speaker labels in the  transcript at paragraph level                |no|Boolean |
| `title`               | defaults to empty String, also used in file names for exported files.                               |no|String  |
| `showTitle`           | Whether to display the provided title                                                               |no|String  |
| `ref`                 | if you want to have access to internal functions such as retrieving content from the editor. eg to save to a server/db. | no | React ref |
| `mediaType`            | can be `audio` or `video`, if not provided, it defaults to video, but the component also uses the url file type to determine and adjust the player (`.wav`, `.mp3`,`.m4a`,`.flac`,`.aiff` are recognised as audio ) |    no    | String |

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

### CSS 
The project uses [bootstrap](https://getbootstrap.com/), and [react-bootstrap](https://react-bootstrap.github.io/). And you'll need to include your own stylesheet in your React app. 
```
npm install bootstrap-css-only
```
eg [bootstrap-css-only](https://www.npmjs.com/package/bootstrap-css-only) is convinient because it doesn't ship with JQuery, that is not a dependency of [react-bootstrap](https://react-bootstrap.github.io/)

and then import in your app 
```
import 'bootstrap-css-only';
```

Alternativly this gives you the extra flexibility to <!-- pick your own styling from [bootswatch](https://bootswatch.com/) ([npm](https://www.npmjs.com/package/bootswatch)) or you can  --> write your own overriding the boostrap classes (see [bootstrap](https://getbootstrap.com/docs/4.0/getting-started/theming/) and [react-bootstrap](https://react-bootstrap.github.io/getting-started/theming/) on themeing) for more info. 

## Documentation

There's a [docs](./docs) folder in this repository.

- [docs/notes](./docs/notes) contains dev draft notes on various aspects of the project. This would generally be converted either into ADRs or guides when ready.
- [docs/guides](./docs/guides) contains walk through / how to.
- [docs/adr](./docs/adr) contains [Architecture Decision Record](https://github.com/joelparkerhenderson/architecture_decision_record).

The [docs folder syncs with gitbook](https://docs.gitbook.com/integrations/github/content-configuration#root) to make the documentation more pleasent to browse at [autoedit.gitbook.io/slate-transcript-editor-docs/](https://autoedit.gitbook.io/slate-transcript-editor-docs/) - _Work in progress_

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

Following storybook [Distribute UI across an organization]](https://www.learnstorybook.com/design-systems-for-developers/react/en/distribute/) guide.

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
npm run deploy:ghpages
```