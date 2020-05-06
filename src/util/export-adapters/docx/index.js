import { Document, Paragraph, TextRun, Packer } from 'docx';
import { shortTimecode } from '../../timecode-converter/';
import { Node } from 'slate';
export default slateToDocx;

function slateToDocx({ value, speakers, timecodes, title = 'Transcript', creator = 'Slate Transcript Editor', description = 'Transcript' }) {
  const doc = new Document({
    creator: creator,
    description: description,
    title: title,
  });

  // Transcript Title
  // TODO: get title in programmatically - optional value
  const textTitle = new TextRun(title);
  const paragraphTitle = new Paragraph();
  paragraphTitle.addRun(textTitle);
  paragraphTitle.heading1().center();
  doc.addParagraph(paragraphTitle);

  // add spacing
  var paragraphEmpty = new Paragraph();
  doc.addParagraph(paragraphEmpty);

  value.forEach(slateParagraph => {
    console.log('slateParagraph', slateParagraph);
    // TODO: use timecode converter module to convert from seconds to timecode

    const paragraphSpeakerTimecodes = new Paragraph();
    if (timecodes) {
      const timecodeStartTime = new TextRun(shortTimecode(slateParagraph.start));
      paragraphSpeakerTimecodes.addRun(timecodeStartTime);
    }
    if (speakers) {
      if (timecodes) {
        const speaker = new TextRun(slateParagraph.speaker).bold().tab();
        paragraphSpeakerTimecodes.addRun(speaker);
      } else {
        const speaker = new TextRun(slateParagraph.speaker).bold();
        paragraphSpeakerTimecodes.addRun(speaker);
      }
    }
    if (timecodes || speakers) {
      doc.addParagraph(paragraphSpeakerTimecodes);
    }

    const paragraphText = new Paragraph(Node.string(slateParagraph));
    const textBreak = new TextRun('').break();
    // const paragraphText = new Paragraph(slateParagraph.children[0].text);
    paragraphText.addRun(textBreak);
    doc.addParagraph(paragraphText);
  });

  const packer = new Packer();

  packer.toBlob(doc).then(blob => {
    const filename = `${title}.docx`;
    // // const type =  'application/octet-stream';
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = filename;
    a.click();

    return blob;
  });
}
