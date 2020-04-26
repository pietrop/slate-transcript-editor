
# Pluck Unique Values from Array of Javascript Objects
from [JamieMason/pluck-unique-values-from-array-of-javascript-objects.md](https://gist.github.com/JamieMason/bed71c73576ba8d70a4671ea91b6178e)
## Implementation

```js
const pluck = key => array => Array.from(new Set(array.map(obj => obj[key])));
```

## Usage

```js
const cars = [
  { brand: 'Audi', color: 'black' },
  { brand: 'Audi', color: 'white' },
  { brand: 'Ferarri', color: 'red' },
  { brand: 'Ford', color: 'white' },
  { brand: 'Peugot', color: 'white' }
];

const getBrands = pluck('brand');

console.log(getBrands(cars));
```

### Output

```json
[
  "Audi",
  "Ferarri",
  "Ford",
  "Peugot"
]
```