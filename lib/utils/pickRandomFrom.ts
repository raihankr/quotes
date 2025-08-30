export default function pickRandomFrom<T extends Record<any, any>>(
  data: T,
): T[keyof T] {
  const randIdx: number = Math.floor(Math.random() * data.length);
  return data[randIdx];
}
