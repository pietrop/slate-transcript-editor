# Features List - draft

## Player controls

- [x] play/pause
- [x] Current time + duration display
- [x] Adjust Playback rate
- [x] auto pause while typing
- [x] Roll back button ~15 sec~ 10 sec default, ~customizable amount~

_Currently not in scope_

- [ ] ~Adjust timecodes <— set a timecode offset - default to zero~
- [ ] ~UI Turn off video preview (toggle on/off)~
- [ ] ~Jump to timecode <— in timecode `hh:mm:ss:ms` format or (hh:mm:ss:ms hh:mm:ss mm:ss m:ss m.ss seconds)~

## ~Keyboard Shortcuts~

_Currently not in scope_

- [ ] ~Keyboard Shortcuts~
- [ ] ~customizable Keyboard Shortcuts~

## HyperTranscript - interactivity

- [x] On text word double click at timecode -> media current time set to word timecode
- [x] Paragraphs highlighted at current time
- [ ] Words highlighted at current time <—-
- [x] Preserve timecodes via seperatee sync btn for now (🔁)
- [ ] Preserve timecodes while editing (eg via debounce function? ) `<--` TBC

_Currently not in scope_

- [ ] ~Scroll Sync, keep current word in view <— (toggle on/off)~

## Transcript Extra Info

- [x] Display Timecodes at paragraph level ~(with offset if present)~
- [x] Display editable speaker names at paragraph level - speaker diarization info

## Save

- [ ] Save btn - triggers save callback for parent component to decide what to dp
- [ ] auto save (without effecting performance, eg when user stops typing ) `<--` TBC
- [ ] ~Save locally - (local storage)~
- [ ] ~Save locally - on interval, eg every `x` char~
- [ ] ~Save to server API end point - Btc~
- [ ] ~Save to server API end point - on interval~

## Import

- [x] option to import accurate text to replace STT one and transpose timecodes (`↑↓`)

## Export

### Text/Word

- [x] Export plain text - without speaker names or timecodes
- [x] Customizable Export plain text, eg with timecodes, speakers names etc..
  - [x] text only
  - [x] with speaker names
  - [x] with timecodes
  - [x] with timecodes & speaker names
- [x] Plain text ([Atlas format](https://atlasti.com))
- [x] Export word document `.docx`)
  - [x] text only
  - [x] with speaker names
  - [x] with timecodes
  - [x] with timecodes & speaker names
- [x] Word document ([OHMS](./notes/OHMS.md))

### Captions/Subtitles

- [x] SRT
- [x] VTT
  - [x] VTT (with speakers)
  - [x] VTT (with speakers & preserving paragraph breaks)
- [x] CSV
- [x] iTT
- [x] TTML (Adobe Premiere)
- [x] Json
- [x] presegmented text
- [ ] ~IIIF~
- [ ] ~SMT and/or CTM ?~<!-- SCLite -->

### Dev export options

- [x] dpe json ([see here for more details on format](./guides/dpe-transcript-format.md))
- [x] slateJs json

## Mobile First

- [x] Works on mobile

Browser compatibility

- [x] Works on Chrome / Brave
- [ ] Firefox
- [ ] ~Windows Explorer IE~

## Dev - STT Adapters

Import Transcript Json as

- [x] dpe json ([see here for more details on dpe format](./guides/dpe-transcript-format.md))

_Input only available in one format, but external modules adapters available for other formats to convert to dpe json_

Current Separate adpaters modules available:

- [x] AssemblyAI [`assemblyai-to-dpe`](https://github.com/pietrop/assemblyai-to-dpe)
- [x] AWS Transcriber [`aws-to-dpe`](https://github.com/pietrop/aws-to-dpe)
- [x] Google STT [`gcp-to-dpe`](https://github.com/pietrop/gcp-to-dpe)
- [ ] IBM Watson STT (in PR [pietrop/digital-paper-edit-electron#52](https://github.com/pietrop/digital-paper-edit-electron/pull/52) module [`ibmwatson-to-dpe`](https://github.com/pietrop/digital-paper-edit-electron/pull/52/files#diff-fc121f3f4370613b5ddb6d5a3ef0a7bff5307f74684e0b482185d1a4572add06) but not extracted as separate module npm/github repo)

### Not in scope

- [ ] ~Speechmatics~ (There's a [`speechmatics-to-dpe`](https://github.com/pietrop/digital-paper-edit-electron/tree/master/src/ElectronWrapper/lib/transcriber/speechmatics/speechmatics-to-dpe) module but not extracted as a separate npm/github repo/module - [since speechmatics web portal API deprecation notice](https://www.speechmatics.com/transcription-web-portal-deprecation-notice/))
- [ ] ~BBC Kaldi~
- [ ] ~News Labs API - BBC Kaldi~
- [ ] ~[autoEdit 2](https://opennewslabs.github.io/autoEdit_2/)~
- [ ] ~Gentle Transcription~
- [ ] ~Gentle Alignment Json~
- [ ] ~Rev~
- [ ] ~3play Media Json~

_If you are interest in an adapter that is currently not avaialble or you made one that could be useful for the community [feel free to raise an issue](https://github.com/pietrop/digital-paper-edit-electron/issues/new?assignees=pietrop&labels=enhancement&template=feature_request.md&title=New%20adapter)_
