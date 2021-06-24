import csvGenerator from './index.js';
const SAMPLE_SRT_JSON_CONTENT = [
  {
    text: "=cmd|' /C calc'!'A1' So tell me, let’s start at the beginning.",
    start: 1.41,
    end: 3.28,
    speaker: 'James Jacoby',
  },
  {
    text: 'How’d you get to Facebook in the beginning?',
    start: 3.28,
    end: 6.1,
    speaker: 'James Jacoby',
  },
  {
    text: 'So I joined the company in the late summer of 2005.',
    start: 6.1,
    end: 9.49,
    speaker: 'James Jacoby',
  },
  {
    text: 'At the time, I was an independent designer and developer working in',
    start: 9.49,
    end: 12.67,
    speaker: 'Soleio Cuervo',
  },
  {
    text: 'San Francisco.',
    start: 12.67,
    end: 13.29,
    speaker: 'Soleio Cuervo',
  },
];

const CSV_SAMPLE_OUTPUT = `N,In,Out,Speaker,Text
1,"00:00:01,410","00:00:03,280","'James Jacoby","'=cmd|' /C calc'!'A1' So tell me, let’s start at the beginning."
2,"00:00:03,280","00:00:06,100","'James Jacoby","'How’d you get to Facebook in the beginning?"
3,"00:00:06,100","00:00:09,490","'James Jacoby","'So I joined the company in the late summer of 2005."
4,"00:00:09,490","00:00:12,670","'Soleio Cuervo","'At the time, I was an independent designer and developer working in"
5,"00:00:12,670","00:00:13,290","'Soleio Cuervo","'San Francisco."`;

test('CSV generator', () => {
  const result = csvGenerator(SAMPLE_SRT_JSON_CONTENT);
  expect(result).toEqual(CSV_SAMPLE_OUTPUT);
});
