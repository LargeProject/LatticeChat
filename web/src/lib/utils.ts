import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function bufferToHexString(buffer: { [key: string]: number }) {
  let hexString = '';
  for (const num of Object.values(buffer)) {
    hexString += num.toString(16);
  }
  return hexString;
}

export function bufferArrayToHexStringArray(
  array: { buffer: { [key: string]: number } }[],
) {
  const hexArray: string[] = new Array(array.length);
  for (let i = 0; i < array.length; i++) {
    hexArray[i] = bufferToHexString(array[i].buffer);
  }
  return hexArray;
}
