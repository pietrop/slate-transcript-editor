import React, {useState, useEffect, useMemo} from 'react';
import { action } from '@storybook/addon-actions';
import TranscriptEditor from './index.js';

import { createEditor } from 'slate';
// https://docs.slatejs.org/walkthroughs/01-installing-slate
// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from 'slate-react';


export default {
  title: 'TranscriptEditor',
  component: TranscriptEditor,
};

const DEMO_MEDIA_URL_KATE =
  "https://download.ted.com/talks/KateDarling_2018S-950k.mp4";
const DEMO_TITLE_KATE =
  "TED Talk | Kate Darling - Why we have an emotional connection to robots";
import DEMO_TRANSCRIPT_KATE from "./sample-data/KateDarling-dpe.json";
export const TranscriptEditorDemoKate = () => <TranscriptEditor url={DEMO_MEDIA_URL_KATE} title={DEMO_TITLE_KATE} jsonData={DEMO_TRANSCRIPT_KATE}/>;


const DEMO_MEDIA_URL_ZUCK_5HOURS = "https://democratic-presidential-debate-stt-analyses.s3.us-east-2.amazonaws.com/Facebook+CEO+Mark+Zuckerberg+FULL+testimony+before+U.S.+senate-pXq-5L2ghhg.mp4";

const DEMO_TITLE_ZUCK_2HOURS ="Facebook CEO Mark Zuckerberg | 2 Hours | full testimony before U.S. Senate ";
import DEMO_TRANSCRIPT_ZUCK_2HOURS_DPE from "./sample-data/Facebook-CEO-Mark-Zuckerberg-FULL-testimony-before-U.S.senate-pXq-5L2ghhg.mp4.dpe-2hours.json";
export const TranscriptEditorDemoZuck2Hours = () => <TranscriptEditor url={DEMO_MEDIA_URL_ZUCK_5HOURS} title={DEMO_TITLE_ZUCK_2HOURS} jsonData={DEMO_TRANSCRIPT_ZUCK_2HOURS_DPE}/>;

const DEMO_TITLE_ZUCK_5HOURS = "Facebook CEO Mark Zuckerberg | 5 Hours | full testimony before U.S. Senate";
import DEMO_TRANSCRIPT_ZUCK_5HOURS_DPE from "./sample-data/Facebook-CEO-Mark-Zuckerberg-FULL-testimony-before-U.S.senate-pXq-5L2ghhg.mp4.dpe.json";
export const TranscriptEditorDemoZuck5Hours = () => <TranscriptEditor url={DEMO_MEDIA_URL_ZUCK_5HOURS} title={DEMO_TITLE_ZUCK_5HOURS} jsonData={DEMO_TRANSCRIPT_ZUCK_5HOURS_DPE}/>;


const SlateEditor = () => {
  const editor = useMemo(() => withReact(createEditor()), [])
  // Add the initial value when setting up our state.
  const [value, setValue] = useState([
    {
      type: 'paragraph',
      children: [{ text: 'A line of text in a paragraph.' }],
    },
  ])

  return (
    <Slate editor={editor} value={value} onChange={value => setValue(value)}>
      Test
      <Editable />
    </Slate>
  )
}


export const SlateSimpleDemo = () => <SlateEditor/>