/*
 * Pluck Unique Values from Array of Javascript Objects
 * https://gist.github.com/JamieMason/bed71c73576ba8d70a4671ea91b6178e
 */
const pluck = key => array => Array.from(new Set(array.map(obj => obj[key])));

export default pluck;
