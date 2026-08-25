import '@angular/compiler';
import { getTestBed, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { afterEach } from 'vitest';

const localStorageStore = new Map<string, string>();

const localStorageMock: Storage = {
  get length() {
    return localStorageStore.size;
  },
  clear() {
    localStorageStore.clear();
  },
  getItem(key: string) {
    return localStorageStore.get(key) ?? null;
  },
  key(index: number) {
    return Array.from(localStorageStore.keys())[index] ?? null;
  },
  removeItem(key: string) {
    localStorageStore.delete(key);
  },
  setItem(key: string, value: string) {
    localStorageStore.set(key, String(value));
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting(),
);

afterEach(() => {
  TestBed.resetTestingModule();
});