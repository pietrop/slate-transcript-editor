```js
{
  transcriptsChunks.length > 1 && (
    <Tabs id="controlled-tab-example" activeKey={key} onSelect={handleOnSelect}>
      {transcriptsChunks.map((chunk, index) => {
        // const startTime = chunk.words[0].start;
        const startTime = chunk[0].startTimecode;
        // const endTime = chunk.words[chunk.words.length - 1].end;
        // const endTime = chunk[chunk.length - 1].startTimecode;
        return (
          <Tab eventKey={index} index={index} title={`${startTime}`}>
            {/* This is so that we don't load the editor's for tabs that are not in view */}
            {/* {currentTranscriptIndex === index && ( */}
            <>
              <TimedTextEditor
                mediaUrl={props.mediaUrl}
                isEditable={props.isEditable}
                autoSaveCsontentType={props.autoSaveContentType}
                showTimecodes={showTimecodes}
                showSpeakers={showSpeakers}
                // transcriptData={props.transcriptData}
                // transcriptData={chunk}
                value={chunk}
                // handleSaveEditor={handleSaveEditor}
                handleSaveEditor={handleSaveEditor}
                handleAutoSaveChanges={handleAutoSaveChanges}
                showTitle={props.showTitle}
                currentTime={currentTime}
                //
                isPauseWhiletyping={isPauseWhiletyping}
                onWordClick={onWordClick}
                handleAnalyticsEvents={props.handleAnalyticsEvents}
                mediaRef={mediaRef}
                transcriptDataLive={props.transcriptDataLive}
              />
            </>
            {/* )} */}
          </Tab>
        );
      })}
    </Tabs>
  );
}
```
