import { describe, it, expect } from 'vitest';
import { openBrowserStorage } from '../../src/save/browser';

describe('openBrowserStorage', () => {
  it('reicht lesen und schreiben an localStorage durch', () => {
    const data = new Map<string, string>();
    const storage = openBrowserStorage({
      localStorage: {
        getItem: (k: string) => data.get(k) ?? null,
        setItem: (k: string, v: string) => { data.set(k, v); },
      } as Storage,
    });
    storage.setItem('a', '1');
    expect(storage.getItem('a')).toBe('1');
    expect(storage.getItem('b')).toBeNull();
  });

  it('liefert einen Speicher, der wirft, wenn schon der Zugriff auf localStorage wirft (privater Modus)', () => {
    const win = { get localStorage(): Storage { throw new DOMException('gesperrt', 'SecurityError'); } };
    let storage: ReturnType<typeof openBrowserStorage> | undefined;
    expect(() => { storage = openBrowserStorage(win); }).not.toThrow();
    expect(() => storage!.getItem('a')).toThrow();
    expect(() => storage!.setItem('a', '1')).toThrow();
  });

  it('wirft erst beim Benutzen, wenn localStorage fehlt', () => {
    const storage = openBrowserStorage({ localStorage: null as unknown as Storage });
    expect(() => storage.getItem('a')).toThrow();
  });
});
