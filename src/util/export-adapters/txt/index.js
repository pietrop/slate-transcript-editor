/**
 * Convert Slate editor contnet to plain text without timecodes or speaker names
 * Text+speaker+timecode
 * TODO: have a separate one or some logic to get text without timecodes?
 *
 * Export looks like
 ```
00:00:13		F_S12
There is a day. About ten years ago when I asked a friend to hold a baby dinosaur called plea. All

00:00:24		F_S1
that

00:00:24		F_S12
he'd ordered and I was really excited about it because I've always loved about this one has really caught technical features. It had more orders and touch sensors. It had an infra red camera and one of the things that had was a tilt sensor so it. Knew what direction. It was facing. If and when you held it upside down.

00:00:46		U_UKN
I thought.
```
 */

import { shortTimecode } from '../../timecode-converter/index.js';
import { Node } from 'slate';
const slateToText = ({ value, speakers, timecodes, atlasFormat }) => {
  return (
    value
      // Return the string content of each paragraph in the value's children.
      .map((n) => {
        if (atlasFormat) {
          return `${timecodes ? `${speakers ? n.speaker : ''}\t[${shortTimecode(n.start)}]\t` : ''}\t${Node.string(n)}`;
        } else {
          return `${timecodes ? `${shortTimecode(n.start)}\t` : ''}${speakers ? n.speaker.toUpperCase() : ''}${
            speakers || timecodes ? '\n' : ''
          }${Node.string(n)}`;
        }
      })
      // Join them all with line breaks denoting paragraphs.
      .join('\n\n')
  );
};

export default slateToText;
