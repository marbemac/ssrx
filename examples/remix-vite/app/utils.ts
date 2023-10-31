import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sleep = (n = 750) => new Promise(r => setTimeout(r, n));

export const rand = () => Math.round(Math.random() * 100);
