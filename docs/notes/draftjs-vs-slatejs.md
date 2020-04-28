# Takeaways form draftJs vs SlateJs 
Some notes on Takeaways form draftJs vs Slate for making timed text editors.

Making a timed text editor is not the same thing as making a rich text editor, there are inherent set of feature that come with the domain, that most rich text editor library had most likely not anticipated at their inception. The rich text editor that is the most lean and efficient is probably the better candidate to be extended in that direction.

* First things first the DraftJs data model is complex and hard to follow, and that gets in the way of development, period.
* SlateJS data model is fairly straight forward json representation, and the parallel to larger DOM data structures and concept makes it's logic consistent and easier to dive into.
* DraftJS uses [immutableJS](https://immutable-js.github.io/immutable-js/), this causes performance issues  [\#437](https://github.com/facebook/draft-js/issues/437) \([\#501](https://github.com/Automattic/simplenote-electron/issues/501)\)
* SlateJs made the decision to[remove immutableJs](https://github.com/ianstormtaylor/slate/milestone/3?closed=1) 
* Adding things to `blockRendererFn` via a "`WrapperBlock`" in DraftJs can introduces a further performance drag, if not handled with care. We use it to add things like speaker names, and time-codes to each paragraphs.
* in SlateJS this is equivalent to use `renderElement`, but its considerably easier to improve its performance, via careful use of closures \(eg if you have a function to handle  on click event for that block moving it outside of that component can be beneficial for performance, as I think it results on less things added to that DOM node\), `.bind` and other practices to avoid bloating the DOM.
* Furthermore SlateJs provides convenient ways to update its Nodes using a Transform, as well as do an update on all the Noted in the editor based on specified conditions \(eg this is useful for updating speakers\)
* pause while typing might introduce performance issues on longer transcripts if on every keystroke it's creating and destroing a timer. \(see[Wait for User to Stop Typing, in JavaScript](https://schier.co/blog/wait-for-user-to-stop-typing-using-javascript)\)
* paragraph levle vs word level highlight. Word level highlight generlaly involves wrapping words into spans
* `handleAutoSaveChanges` function in it's current implementation gets in the way of performance for longer transcripts.