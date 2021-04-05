/*
 * Pluck Unique Values from Array of Javascript Objects
 * https://gist.github.com/JamieMason/bed71c73576ba8d70a4671ea91b6178e
 */
function pluck<T, K extends keyof T>(key: K): (arr: T[]) => T[K][] {
  return (array: T[]) => Array.from(new Set(array.map((obj) => obj[key])));
}

export default pluck;
