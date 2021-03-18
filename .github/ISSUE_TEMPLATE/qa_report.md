---
name: QA Report
about: Create a QA report to audit the app before a major release
title: '[QA] Main checklist'
labels: QA Report
assignees:
---

## QA Report

<!-- See [QA](/docs/QA/index.md) instructions in docs for more info on the process. -->

_If you run into issues with any of the individual items, raise a separate issue for each as a [QA Report - individual issue](https://github.com/newscorp-ghfb/dj-tools-transcribe/issues/new?assignees=&labels=QA%20Issue&template=qa_individual_issue_report.md&title=[QA]%20Issue%20#1.1%20Can%20edit%20the%0text). Write a note of the item numnber, and "title" in the issue title and description._

<!-- Top tip: view the text of this issue in "preview" mode to make it easier to click through the checkboxes -->

## QA ENV

Make a note of which ENV you are doing this QA in, eg local storybook, storybook on github pages, or some other react enviroment.

- [ ] storybook local
- [ ] [storybook in github pages](https://pietropassarelli.com/slate-transcript-editor/?path=/story/slatetranscripteditor--demo)
- [ ] some other React CRA Enviroment
- [ ] Some other React NextJS enviroment
- [ ] Some other React enviroment

## 1.QA transcript editor

- [ ] 1.1 Can edit the text
- [ ] 1.2 Double click on words
- [ ] 1.3 Split paragraph
- [ ] 1.4 Confirm that enter beginning and end of paragraphs does not work by design
- [ ] 1.5 Delete at beginning of paragraphs to merge two paragraphs --> Expect timecodes adjustment + speaker merge.
- [ ] 1.6 Same/similar got paragraph split
- [ ] 1.7 Unable to enter delete or enter with select ok across multiple paragraphs —> select ok collapsed
- [ ] 1.8 Unable to hit enter in the middle of a word
- [ ] 1.9 Can edit, add, delete replace text, --> And then click align Or click save
- [ ] 1.10 Test pause while typing feature

## 2.Test export

- [ ] 2.1 All file format**s** + inspect content. Check matches expected.
  - [ ] **Text Export options**
    - [ ] Text (<code>.txt</code>)
    - [ ] Text (Speakers)
    - [ ] Text (Timecodes)
    - [ ] Text (Speakers & Timecodes)
    - [ ] Text (Atlas format)
    - [ ] Word (<code>.docx</code>)
    - [ ] Word (Speakers)
    - [ ] Word (Timecodes)
    - [ ] Word (Speakers & Timecodes)
    - [ ] Word (OHMS)
  - [ ] **Closed Captions Export**
    - [ ] Srt (`.srt`)
    - [ ] VTT (`.vtt`)
    - [ ] VTT with speakers (`.vtt`)
    - [ ] VTT with speakers and paragraphs (`.vtt`)
    - [ ] iTT (`.itt`)
    - [ ] TTML (`.ttml`)
    - [ ] TTML for Adobe Premiere (`.ttml`)
    - [ ] CSV (`.csv`)
    - [ ] Pre segmented txt (`.txt`)
    - [ ] Json (`.json`)
  - [ ] **Developer options**
    - [ ] SlateJs (<code>.json</code>)
    - [ ] DPE (<code>.json</code>)

## 3.Buttons

- [ ] 3.1 Side btns test, insert special symbols etc...
  - [ ] 3.1.1 Save btn
  - [ ] 3.1.2 Insert paragraph break btn
  - [ ] 3.1.3 insert `[INAUDIBLE]` in text btn
  - [ ] 3.1.4 Insert music note 🎵 in text btn
  - [ ] 3.1.5 Pause while typing ⏸️ btn
  - [ ] 3.1.6 Restore timecodes ♻ btn
  - [ ] 3.1.7 Replace whole text ↑↓ btn
  - [ ] 3.1.8 Info ❓ btn
- [ ] 3.2 Playback speed `x` btn

## 4.Other transcript functionalities

- [ ] 4.1 Double click on word jumps to that point
- [ ] 4.2 Single click on time codes jump to that point
- [ ] 4.3 Click on paragraph to change One speaker
- [ ] 4.4 Click on paragraph to change all matching s speakers

## 5.Other

- [ ] 5.1 Mobile test?
- [ ] 5.2 Done?

<!-- Anything else noteworthy, eg things you noticed that are either bugs or not quiet right, outside of the steps above?  -->

_NA_
