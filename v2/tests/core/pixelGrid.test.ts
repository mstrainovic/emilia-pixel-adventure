import { describe, it, expect } from 'vitest';
import { measureDevicePixels } from '../../src/core/pixelGrid';

const rect = (width: number, height: number): DOMRectReadOnly =>
  ({ x: 0, y: 0, top: 0, left: 0, right: width, bottom: height, width, height, toJSON: () => ({}) }) as DOMRectReadOnly;

describe('measureDevicePixels', () => {
  it('übernimmt die gemessenen Gerätepixel unverändert', () => {
    const entry = {
      devicePixelContentBoxSize: [{ inlineSize: 1079, blockSize: 1919 }] as unknown as ReadonlyArray<ResizeObserverSize>,
      contentRect: rect(411, 731),
    };
    expect(measureDevicePixels(entry, 2.625)).toEqual({ deviceWidth: 1079, deviceHeight: 1919 });
  });

  it('rechnet ohne Gerätepixel-Messung aus der CSS-Größe und rundet', () => {
    const entry = { contentRect: rect(411, 731) } as unknown as Pick<ResizeObserverEntry, 'devicePixelContentBoxSize' | 'contentRect'>;
    expect(measureDevicePixels(entry, 2.625)).toEqual({ deviceWidth: 1079, deviceHeight: 1919 });
  });

  it('verwirft eine Gerätepixel-Messung, die nicht zur Pixeldichte passt (Chromium-Emulation)', () => {
    // Chromium meldet bei emulierter Pixeldichte die CSS-Größe als Gerätepixel
    const entry = {
      devicePixelContentBoxSize: [{ inlineSize: 810, blockSize: 1080 }] as unknown as ReadonlyArray<ResizeObserverSize>,
      contentRect: rect(810, 1080),
    };
    expect(measureDevicePixels(entry, 1.25)).toEqual({ deviceWidth: 1013, deviceHeight: 1350 });
  });

  it('liefert mindestens einen Gerätepixel', () => {
    const entry = { contentRect: rect(0, 300) } as unknown as Pick<ResizeObserverEntry, 'devicePixelContentBoxSize' | 'contentRect'>;
    expect(measureDevicePixels(entry, 2)).toEqual({ deviceWidth: 1, deviceHeight: 600 });
    const measured = {
      devicePixelContentBoxSize: [{ inlineSize: 0, blockSize: 0 }] as unknown as ReadonlyArray<ResizeObserverSize>,
      contentRect: rect(0, 0),
    };
    expect(measureDevicePixels(measured, 1)).toEqual({ deviceWidth: 1, deviceHeight: 1 });
  });
});
