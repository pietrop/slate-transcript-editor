import alignDiraizedText from 'align-diarized-text/src/index';

addEventListener('message', (event) => {
  const response = alignDiraizedText(...event.data);
  postMessage(response);
});
