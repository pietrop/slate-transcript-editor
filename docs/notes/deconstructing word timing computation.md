```js
(startTime * (nodeWords.length - idx) + endTime * idx) / nodeWords.length,
```

## first word

```
start = 1.2
endTime = 3.5
nodeWords.length = 10
idx = 0
```

```js
 (   1.2    *  (   10          -  0 ) +     3.5 *  0 ) /    10
(startTime * (nodeWords.length - idx) + endTime * idx) / nodeWords.length,
```

```
(1.2*(10-0)+3.5*0)/10 = 1.2
```

## second word

```
start = 1.2
endTime = 3.5
nodeWords.length = 10
idx = 1
```

```js
 (   1.2    *  (   10          -  1 ) +     3.5 *  1 ) /    10
(startTime * (nodeWords.length - idx) + endTime * idx) / nodeWords.length,
```

## third word

```
start = 1.2
endTime = 3.5
nodeWords.length = 10
idx = 2
```

```js
 (   1.2    *  (   10          -  2 ) +     3.5 *  2 ) /    10
(startTime * (nodeWords.length - idx) + endTime * idx) / nodeWords.length,
```

```
(1.2*(10-2)+3.5*2)/10
(1.2*(8)+3.5*2)/10
(1.2*(8)+7)/10
(9.6+7)/10
16.6/10
1.6600000000000001
```
