# css-injection-karaoke

```jsx
<style scoped>
{`
    /* Next words */
    .timecode[data-previous-timings~="${parseInt(currentTime)}"]{
        color:  #6c757d; /*Bootstrap grey for secondary*/
    }

    /* Previous words */
    .timecode:not([data-previous-timings~="${parseInt(currentTime)}"]){
        color: #343a40!important /* Bootstrap black, for dark */
    }

    .timecode:not([data-start^="${parseInt(currentTime)}"]){
        color: orange!important// #6c757d; /*Bootstrap grey for secondary*/
    }  

    .timecode[data-start^="${parseInt(currentTime)}"]{
        color: red!important //#343a40!important /* Bootstrap black, for dark */
    }
`}
</style>
```

