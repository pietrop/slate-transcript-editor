import React, { useState, useEffect, useMemo } from 'react';
import { createEditor } from 'slate';
// https://docs.slatejs.org/walkthroughs/01-installing-slate
// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from 'slate-react';

export default {
  title: 'SlateSimpleEditor',
  component: SlateSimpleEditor,
};

const SlateSimpleEditor = () => {
  const editor = useMemo(() => withReact(createEditor()), []);
  // Add the initial value when setting up our state.
  const [value, setValue] = useState([
    {
      type: 'paragraph',
      children: [{ text: 'A line of text in a paragraph.' }],
    },
  ]);

  return (
    <Slate editor={editor} value={value} onChange={value => setValue(value)}>
      <Editable />
    </Slate>
  );
};

export const SlateSimpleDemo = () => <SlateSimpleEditor />;
