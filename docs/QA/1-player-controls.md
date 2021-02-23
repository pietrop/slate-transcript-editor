# Item to test #1: Player Controls

## Item to test #1.1: Player Controls - Btns

From left to right

![player-controls](./images/player-controls.png)

| item  | Buttons         | Steps          | Expected Results                                     |
| ----- | --------------- | -------------- | ---------------------------------------------------- |
| 1.1.1 | current time    | display        | display current time of media, updates while playing |
| 1.1.2 | Duration        | display        | display duration of media                            |
| 1.1.3 | Playback speed  | click - select | change the playback speed, of amount from dropdown   |
| 1.1.4 | RollBack/rewind | click          | Rewind 10 sec                                        |

## HTML5 functionality

| item  | Buttons                 | Steps          | Expected Results                                    |
| ----- | ----------------------- | -------------- | --------------------------------------------------- |
| 1.1.5 | play                    | click          | play media, audio or video                          |
| 1.1.6 | 'Picture in Picture' 📺 | click          | hide or show video as separate window always on top |
| 1.1.7 | Volume                  | click - Toggle | Volume + Mutes and un-mutes media                   |
| 1.1.7 | Progress bar            | click or scrub | changes current time                                |

_these don't necessarily need to be tested, but only the part that effect the transcript editor's specific features and functionalities_

## QA

### Item to test #1.1.1: Player Controls - current time

#### Steps:

- [Load storybook](https://pietropassarelli.com/slate-transcript-editor)
- click play

#### Expected Results:

- [ ] See current time change

---

### Item to test #1.1.1: Player Controls - Duration

#### Steps:

- [Load storybook](https://pietropassarelli.com/slate-transcript-editor)
- click play

#### Expected Results:

- [ ] See duration time reflext current duration of media

---

#### Item to test #1.3: Player Controls - Progress Bar

##### Steps:

- Click inside the progress bar

##### Expected Results:

- [ ] Expect the progress bar play head to change to clicked point
- [ ] Expect current time display in player controls to update accordingly
- [ ] If media was paused, expect media to start playing
- [ ] Expect the editor paragraph hilight to jump to the one containting the current word below <---

<!-- #### Item to test #1.4: Player Controls - 'Picture in Picture'

##### Steps:

- [ ] Click the 'Picture in Picture' icon 📺

##### Expected Results:

- [ ] If video, expect the video to appear as resizable floating window always on top
- [ ] Expect if click picture in picture icon again for video to go back to it's original place
- [ ] if in chrome expect it to work
- [ ] if in browser other then chrome (Safari, Firefox etc) expect to get warning message saying browser is not supported and to use in chrome instead. -->

#### Item to test #1.11: Player Controls - Save 💾

##### Steps:

- [ ] edit some text
- [ ] Click the 'Save' icon

##### Expected Results:

- [ ] Expect save action callback to be triggered in storybook with current content
