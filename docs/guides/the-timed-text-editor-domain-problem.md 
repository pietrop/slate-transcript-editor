# Timed Text Editor Domain Problem - draft

**TL;DR:** The issue is that when the user corrects the text, it might delete, substitute or insert new words. These operations tend to loose the time-codes originally associated with each word. So we are investigating a way to re-align the and preserve the timcodes. Keeping an eye on performance issues that arise for transcripts over one 1 hour.

Pagination might be a ~quick~ fix, but it introduces another set of problems.

## Context

Some <s>quick</s> background for those new to the project.

`slate-transcript-editor` builds on top of the lessons learned from developing [@bbc/react-transcript-editor](https://github.com/bbc/react-transcript-editor) (based on [draftJs](https://draftjs.org/)).

As the name suggests `slate-transcript-editor` is built on top of [slateJs](https://slatejs.org) augmenting it with transcript editing domain specific functionalities.

For more on "draftjs vs slatejs" for this use case, see [these notes](https://github.com/pietrop/slate-transcript-editor/blob/master/docs/notes/draftjs-vs-slatejs.md).

It is a react transcript editor component to allow users to correct automated transcriptions of audio or video generated from speech to text services.

It is used in use cases such as [autoEdit](https://www.autoedit.io), an app to edit audio/video interviews, as well as other situation where users might need to correct transcriptions, for a variety of use cases.

The ambition is to have a component that takes in timed text (eg a list of words with start times), allows the user to correct the text (providing some convenience features, such pause while typing, and keeping some kind of correspondence between the text and audio/video) and on save returns timed text in the same json format (referred to, for convenience, as dpe format, after the digital paper edit project where it was first formalized).

```js
{
  "words": [
    {
      "end": 0.46, // in seconds
      "start": 0,
      "text": "Hello"
    },
    {
      "end": 1.02,
      "start": 0.46,
      "text": "World"
    },
    ...
    ]
    "paragraphs": [
    {
      "speaker": "SPEAKER_A",
      "start": 0,
      "end": 3
    },
    {
      "speaker": "SPEAKER_B",
      "start": 3,
      "end": 19.2
    },
    ...
    ]
 }
```

see [here for more info on the dpe format](./dpe-transcript-format.md)

As part of `slate-transcript-editor` this dpe format is then converted into [slateJs](https://www.slatejs.org/) data model.

[see storybook demo to see the `slate-transcript-editor` react componet it in practice](https://pietropassarelli.com/slate-transcript-editor)

Over time in this domain folks have tried a variety of approaches to solve this problem.

### compute the timings

listening to char insertion, deletion and detecting word boundaries, you could estimate the time-codes. This is a very fiddly approach, as there's a lot of edge cases to handle. Eg what if a user deletes a whole paragraph? And over time the accuracy of the time-codes slowly fades (if there's a lot of correction done to the text, eg if the STT is not very accurate).

### alignment - server side - Aeneas

Some folks have had some success running server side alignment.
For example in [pietrop/fact2_transcription_editor](https://github.com/pietrop/fact2_transcription_editor) the editor was one giant content editable div, and on save it would send to the server plain text version (literally using `.innerText`). @frisch1 then server side would then align it against the original media using the [aeneas aligner](https://github.com/readbeyond/aeneas) by @pettarin.

Aeneas converts the text into speech (TTS) and then uses that wave form to compare it against the original media to very quickly produce the alignment, restoring time-codes, either at word or line level depending on your preferences.

Aeneas uses dynamic time warping of math frequency capsule coefficient algo (🤯). You can read more about how Aeneas works in the [How Does This Thing Work?](https://github.com/readbeyond/aeneas/blob/4d200a050690903b30b3d885b44714fecb23f18a/wiki/HOWITWORKS.md) section of their docs.

This approach for [fact2_transcription_editor](https://github.com/pietrop/fact2_transcription_editor) was some what successful, Aeneas is very fast. However

- the alignment is only done on save to the database.
- If a user continues to edit the page over time more and more of the time-codes will disappear until the refresh the page, and the "last saved and aligned" transcript gets fetch from the db.
- And to set this up as "a reusable component" you'd always have to pair with a server side module to do the alignment
- Aeneas is great but in it's current form does not exist as an npm module (as far as I am aware of?) it's written in python and has some system dependencies such as ffmpeg, TTS engine etc..

<details>
  <summary>side note on word level time-codes and clickable words</summary>

I should mention that in [fact2_transcription_editor](https://github.com/pietrop/fact2_transcription_editor) you could click on individual words to jump to corresponding point in the media.

With something equivalent to

```html
<span data-start-time="0" data-end-time="0.46" classNames="words"> Hello </span> ...
```

A pattern I had first come across in [hyperaud.io's blog description of "hypertranscripts"](https://hyperaud.io/blog/hypertranscripts/) by @maboa & @gridinoc

</details>

### STT based alignment - Gentle

Some folks have also used [Gentle](https://github.com/lowerquality/gentle), by @maxhawkins, a forced aligner based on Kaldi as a way to get alignment info.

I've personally [used it for autoEdit2](https://autoedit.gitbook.io/user-manual/setup-stt-apis/setup-stt-apis-gentle) as an open source offline option for users to get transcriptions. But I haven't used it for alignment, as STT based alignment is slower then TTS one.

### alignment - client side - option 1 (stt-align)

Another option is to run the alignment client side. by doing a diff between the human corrected (accurate) text and the timed text from the STT engine, and to transpose the time-codes from the second to the first.

<details>
  <summary>some more background and info on this solution</summary>

This solution was first introduced by @chrisbaume in [bbc/dialogger](https://github.com/bbc/dialogger) ([presented at textAV 2017](https://textav.gitbook.io/textav-event/projects/bbc-dialogger)) it modified [CKEditor](https://ckeditor.com) (at the time draftJS was not around yet) and run the alignment server side in a custom python module [sttalign.py](https://github.com/pietrop/stt-align-node/blob/master/docs/python-version/sttalign.py)

With @chrisbaume's help I converted the python code into a node module [stt-align-node](https://github.com/pietrop/stt-align-node) which is used in [@bbc/react-transcript-editor](https://github.com/bbc/react-transcript-editor) and [slate-transcript-editor](https://github.com/pietrop/slate-transcript-editor)

one issue in converting from python to [the node version](https://github.com/pietrop/stt-align-node/blob/master/src/align/index.js) is that for diffing python uses the [difflib](https://github.com/pietrop/stt-align-node/blob/master/docs/python-version/sttalign.py#L31) that is [part of the core library](https://docs.python.org/3/library/difflib.html) while in the node module [we use](https://github.com/pietrop/stt-align-node/blob/master/src/index.js#L27) , [difflib.js](https://github.com/qiao/difflib.js) which might not be as performant (❓ 🤷‍♂️ )

When a word is inserted, (eg was not recognized by the STT services and the users adds it manually) in this type of alignment there are no time-codes for it. Via interpolation of time-codes of neighboring words, we bring back add some time-codes. In the python version the time-codes interpolation is done via [numpy](https://numpy.org) to [linearly interpolate the missing times](https://github.com/pietrop/stt-align-node/blob/master/docs/python-version/sttalign.py#L3-L16)

In the [node version the interpolation](https://github.com/pietrop/stt-align-node/blob/master/src/align/index.js#L61-L95) is done via the [everpolate](http://borischumichev.github.io/everpolate/#linear) module and again it might not be as performant as the python version (❓ 🤷‍♂️ ).

</details>

However in [@bbc/react-transcript-editor](https://github.com/bbc/react-transcript-editor) and [slate-transcript-editor](https://github.com/pietrop/slate-transcript-editor) initially every time the user stopped typing for longer then a few seconds, we'd trigger a save, which was proceeded by an alignment. This became very un-performant, especially for long transcriptions, (eg approximately over 1 hour) because whether you change a paragraph or just one word, it would run the alignment across the whole text. Which turned out to be a pretty expensive operation.

This lead to removing user facing word level time-codes in the slateJs version to improve performance on long transcriptions. and removing auto save. However, on long transcription, even with manual save, sometimes the `stt-align-node` module can temporary freeze the UI for a few seconds 😬 or in the worst case scenario sometimes even crash the page 😓 ☠️

<details>
  <summary>more on retaining speaker labels after alignement </summary>
There is also a workaround for handling retaining speaker labels at paragraph level when using this module to run the alignment.

The module itself only aligns the words. To re-introduce the speakers, you just compare the aligned words with the paragraphs with speaker info. [Example of converting into slateJs format](https://github.com/pietrop/slate-transcript-editor/blob/master/src/util/update-timestamps/index.js#L15-L47) or into [dpe format from slateJs](https://github.com/pietrop/slate-transcript-editor/blob/pagination/src/util/export-adapters/slate-to-dpe/index.js#L14-L40)

</details>

Which is why in PR https://github.com/pietrop/slate-transcript-editor/pull/30 we are considering pagination. But before a closer look into that, let's consider one more option.

### alignment - client side - option 2 (web-aligner)

Another option explored by @chrisbaume at textAV 2017 was to make a [webaligner](https://github.com/chrisbaume/webaligner) ([example here](http://pietropassarelli.com/webaligner-example/index.html) [and code of the example here](https://github.com/chrisbaume/webaligner-example)) to create a ~simple~ lightweight client-side forced aligner for timed text levering the browser audio API ([AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext)), and doing computation similar to Aeneas(? not sure about this last sentce?).

This option is promising, but was never fully fleshed out to a usable state. It might also only work when aligning small sentences due to browser's limitations(?).

### Overtyper

Before considering pagination, a completely different approach to the UX problem of correcting text is [overtyper](https://github.com/alexnorton/overtyper) by @alexnorton & @maboa from textAV 2017. Where you follow along a range of words being hiligteed as the media plays. To correct you start typing from the last correct word you heard until the next correct one, so that the system can adjust/replace/insert all the once in between. This makes the alignment problem a lot more narrow, and new word timings can be more easily computed.

This is promising, but unfortunately as far as I know there hasn't been a lot of user testing to this approach to validate.
