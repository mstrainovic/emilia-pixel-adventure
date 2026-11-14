import { describe, expect, it } from 'vitest';
import { KeyboardSource } from '../../src/input/keyboard';

type Listener = (e: never) => void;

/** Ziel, das Ereignisse nur verteilt; kein Browser nötig. */
class FakeTarget {
  readonly listeners = new Map<string, Set<Listener>>();
  addEventListener(type: string, fn: Listener): void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)?.add(fn);
  }
  removeEventListener(type: string, fn: Listener): void {
    this.listeners.get(type)?.delete(fn);
  }
  count(): number {
    return [...this.listeners.values()].reduce((n, s) => n + s.size, 0);
  }
  /** Verteilt ein Ereignis; liefert, ob `preventDefault()` aufgerufen wurde. */
  fire(
    type: string,
    init: { code?: string; repeat?: boolean; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean; target?: unknown } = {},
  ): boolean {
    let prevented = false;
    const event = {
      type,
      code: init.code ?? '',
      repeat: init.repeat ?? false,
      ctrlKey: init.ctrlKey ?? false,
      metaKey: init.metaKey ?? false,
      altKey: init.altKey ?? false,
      target: init.target,
      preventDefault: () => {
        prevented = true;
      },
    };
    for (const fn of this.listeners.get(type) ?? []) (fn as (e: unknown) => void)(event);
    return prevented;
  }
  down(code: string, repeat = false, target?: unknown): boolean {
    return this.fire('keydown', { code, repeat, target });
  }
  up(code: string, target?: unknown): boolean {
    return this.fire('keyup', { code, target });
  }
}

/** Ereignisziel wie ein Element: `closest` trifft, wenn der Wähler das Tag nennt (`button`, `input` …). */
function element(tag: string): { closest: (selector: string) => unknown } {
  const self = { closest: (selector: string) => (selector.split(',').map((t) => t.trim()).includes(tag) ? self : null) };
  return self;
}

function setup(): { target: FakeTarget; keys: KeyboardSource } {
  const target = new FakeTarget();
  const keys = new KeyboardSource(target as unknown as Pick<Window, 'addEventListener' | 'removeEventListener'>);
  keys.attach();
  return { target, keys };
}

describe('KeyboardSource', () => {
  it('ist die Tastatur', () => {
    expect(setup().keys.device).toBe('keys');
  });

  it('WASD und Pfeile bewegen', () => {
    const { target, keys } = setup();
    target.down('KeyD');
    expect(keys.move).toEqual({ x: 1, y: 0 });
    target.up('KeyD');
    target.down('ArrowUp');
    expect(keys.move).toEqual({ x: 0, y: -1 });
    target.up('ArrowUp');
    target.down('KeyS');
    expect(keys.move).toEqual({ x: 0, y: 1 });
    target.up('KeyS');
    target.down('ArrowLeft');
    expect(keys.move).toEqual({ x: -1, y: 0 });
  });

  it('links und rechts zugleich heben sich auf', () => {
    const { target, keys } = setup();
    target.down('KeyA');
    target.down('KeyD');
    expect(keys.move.x).toBe(0);
    target.up('KeyA');
    expect(keys.move.x).toBe(1);
  });

  it('KeyD und ArrowRight zugleich ergeben 1, nicht 2', () => {
    const { target, keys } = setup();
    target.down('KeyD');
    target.down('ArrowRight');
    expect(keys.move.x).toBe(1);
    target.up('KeyD');
    expect(keys.move.x).toBe(1);
    target.up('ArrowRight');
    expect(keys.move.x).toBe(0);
  });

  it('schräg hat den Betrag 1', () => {
    const { target, keys } = setup();
    target.down('KeyD');
    target.down('KeyS');
    const m = keys.move;
    expect(Math.hypot(m.x, m.y)).toBeCloseTo(1, 9);
    expect(m.x).toBeGreaterThan(0);
    expect(m.y).toBeGreaterThan(0);
  });

  it('Shift links und rechts rennen', () => {
    const { target, keys } = setup();
    expect(keys.run).toBe(false);
    target.down('ShiftLeft');
    expect(keys.run).toBe(true);
    target.up('ShiftLeft');
    target.down('ShiftRight');
    expect(keys.run).toBe(true);
    target.up('ShiftRight');
    expect(keys.run).toBe(false);
  });

  it('blur lässt alle Tasten los', () => {
    const { target, keys } = setup();
    target.down('KeyD');
    target.down('KeyS');
    target.down('ShiftLeft');
    target.fire('blur');
    expect(keys.move).toEqual({ x: 0, y: 0 });
    expect(keys.run).toBe(false);
  });

  it('Tasten lösen die richtigen Handlungen aus', () => {
    const { target, keys } = setup();
    const table: Array<[string, string]> = [
      ['KeyE', 'interact'],
      ['Space', 'confirm'],
      ['Enter', 'confirm'],
      ['Escape', 'cancel'],
      ['KeyH', 'help'],
      ['KeyM', 'menu'],
      ...[1, 2, 3, 4, 5, 6, 7, 8].map((n): [string, string] => [`Digit${n}`, `hotbar${n}`]),
    ];
    for (const [code, action] of table) {
      target.down(code);
      target.up(code);
      expect(keys.drainPressed()).toEqual([action]);
    }
    expect(keys.drainPressed()).toEqual([]);
  });

  it('keydown mit repeat erzeugt keinen zweiten Druck', () => {
    const { target, keys } = setup();
    target.down('KeyE');
    target.down('KeyE', true);
    target.down('KeyE', true);
    expect(keys.drainPressed()).toEqual(['interact']);
  });

  it('behandelte Tasten rufen preventDefault, andere nicht', () => {
    const { target } = setup();
    for (const code of ['KeyD', 'ArrowDown', 'Space', 'ShiftLeft', 'Digit3', 'Escape']) {
      expect(target.down(code)).toBe(true);
      expect(target.up(code)).toBe(true);
    }
    for (const code of ['KeyF', 'KeyQ', 'KeyI', 'Tab', 'F5', 'KeyR']) {
      expect(target.down(code)).toBe(false);
      expect(target.up(code)).toBe(false);
    }
  });

  it('freie Tasten (F, Q, I, Tab) erzeugen nichts', () => {
    const { target, keys } = setup();
    for (const code of ['KeyF', 'KeyQ', 'KeyI', 'Tab']) target.down(code);
    expect(keys.drainPressed()).toEqual([]);
    expect(keys.move).toEqual({ x: 0, y: 0 });
  });

  it('detach entfernt die Zuhörer und lässt alles los; attach zweimal hängt nicht doppelt ein', () => {
    const { target, keys } = setup();
    keys.attach();
    expect(target.count()).toBe(5);
    target.down('KeyD');
    keys.detach();
    expect(target.count()).toBe(0);
    expect(keys.move).toEqual({ x: 0, y: 0 });
    target.down('KeyD');
    expect(keys.move).toEqual({ x: 0, y: 0 });
  });

  it('reset lässt alles los und verwirft offene Drücke', () => {
    const { target, keys } = setup();
    target.down('KeyD');
    target.down('KeyE');
    keys.reset();
    expect(keys.move).toEqual({ x: 0, y: 0 });
    expect(keys.drainPressed()).toEqual([]);
  });

  describe('Tastatur neben HTML-Knöpfen und Eingabefeldern', () => {
    it.each(['Enter', 'Space'])('%s auf einem Knopf bleibt dem Browser: kein preventDefault, keine Handlung', (code) => {
      const { target, keys } = setup();
      const button = element('button');
      expect(target.down(code, false, button)).toBe(false);
      expect(target.up(code, button)).toBe(false);
      expect(keys.drainPressed()).toEqual([]);
    });

    it.each(['Enter', 'Space'])('%s auf dem Seitenrumpf oder ohne closest wirkt als confirm', (code) => {
      const { target, keys } = setup();
      expect(target.down(code, false, element('body'))).toBe(true);
      expect(keys.drainPressed()).toEqual(['confirm']);
      expect(target.down(code, false, {})).toBe(true);
      expect(keys.drainPressed()).toEqual(['confirm']);
      expect(target.down(code, false, { closest: undefined })).toBe(true);
      expect(keys.drainPressed()).toEqual(['confirm']);
      expect(target.down(code)).toBe(true);
      expect(keys.drainPressed()).toEqual(['confirm']);
    });

    it('Laufen und alle übrigen Tasten wirken auch bei Fokus auf einem Knopf', () => {
      const { target, keys } = setup();
      const button = element('button');
      expect(target.down('KeyD', false, button)).toBe(true);
      expect(keys.move.x).toBe(1);
      target.up('KeyD', button);
      for (const [code, action] of [['KeyE', 'interact'], ['Escape', 'cancel'], ['KeyM', 'menu'], ['KeyH', 'help'], ['Digit3', 'hotbar3']]) {
        expect(target.down(code!, false, button)).toBe(true);
        expect(keys.drainPressed()).toEqual([action]);
      }
    });

    it('keyup von D im Eingabefeld lässt die zuvor gehaltene Taste los', () => {
      const { target, keys } = setup();
      target.down('KeyD');
      target.up('KeyD', element('input'));
      expect(keys.move.x).toBe(0);
    });

    it.each(['input', 'textarea', 'select', '[contenteditable="true"]'])('in %s gehört jede Taste außer Escape dem Feld', (tag) => {
      const { target, keys } = setup();
      const field = element(tag);
      for (const code of ['KeyD', 'KeyE', 'Enter', 'Space', 'ShiftLeft', 'Digit1']) {
        expect(target.down(code, false, field)).toBe(false);
        expect(target.up(code, field)).toBe(false);
      }
      expect(keys.move).toEqual({ x: 0, y: 0 });
      expect(keys.run).toBe(false);
      expect(keys.drainPressed()).toEqual([]);
    });

    it('Escape im Eingabefeld wirkt als cancel', () => {
      const { target, keys } = setup();
      expect(target.down('Escape', false, element('input'))).toBe(true);
      expect(keys.drainPressed()).toEqual(['cancel']);
    });
  });

  describe('klebende Tasten', () => {
    /** Seite mit eigenem Ziel für `visibilitychange`; `hidden` lässt sich umschalten. */
    function setupWithPage(): { target: FakeTarget; page: FakeTarget & { hidden: boolean }; keys: KeyboardSource } {
      const target = new FakeTarget();
      const page = Object.assign(new FakeTarget(), { hidden: false });
      const keys = new KeyboardSource(
        target as unknown as Pick<Window, 'addEventListener' | 'removeEventListener'>,
        page as unknown as Pick<Document, 'addEventListener' | 'removeEventListener' | 'hidden'>,
      );
      keys.attach();
      return { target, page, keys };
    }

    it.each(['MetaLeft', 'MetaRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight'])(
      '%s gedrückt lässt alle gehaltenen Tasten los',
      (mod) => {
        const { target, keys } = setup();
        target.down('KeyD');
        target.down('ShiftLeft');
        target.fire('keydown', {
          code: mod,
          metaKey: mod.startsWith('Meta'),
          ctrlKey: mod.startsWith('Control'),
          altKey: mod.startsWith('Alt'),
        });
        expect(keys.move.x).toBe(0);
        expect(keys.run).toBe(false);
      },
    );

    it.each(['ctrlKey', 'metaKey', 'altKey'] as const)('keydown mit %s wird weder gemerkt noch unterdrückt', (flag) => {
      const { target, keys } = setup();
      for (const code of ['KeyD', 'KeyE', 'KeyA']) {
        expect(target.fire('keydown', { code, [flag]: true })).toBe(false);
      }
      expect(keys.move).toEqual({ x: 0, y: 0 });
      expect(keys.drainPressed()).toEqual([]);
    });

    it('Shift zählt nicht als Zusatztaste: Shift + D rennt', () => {
      const { target, keys } = setup();
      target.down('ShiftLeft');
      expect(target.down('KeyD')).toBe(true);
      expect(keys.run).toBe(true);
      expect(keys.move.x).toBe(1);
    });

    it('contextmenu lässt alles los', () => {
      const { target, keys } = setup();
      target.down('KeyD');
      target.fire('contextmenu');
      expect(keys.move.x).toBe(0);
    });

    it('pagehide lässt alles los', () => {
      const { target, keys } = setup();
      target.down('KeyD');
      target.fire('pagehide');
      expect(keys.move.x).toBe(0);
    });

    it('visibilitychange bei verborgener Seite lässt los, bei sichtbarer nicht', () => {
      const { target, page, keys } = setupWithPage();
      target.down('KeyD');
      page.fire('visibilitychange');
      expect(keys.move.x).toBe(1);
      page.hidden = true;
      page.fire('visibilitychange');
      expect(keys.move.x).toBe(0);
    });

    it('detach meldet alle Empfänger ab und die Quelle reagiert auf nichts mehr', () => {
      const { target, page, keys } = setupWithPage();
      expect(target.count() + page.count()).toBe(6);
      keys.detach();
      expect(target.count() + page.count()).toBe(0);
      target.down('KeyD');
      page.hidden = true;
      page.fire('visibilitychange');
      target.fire('contextmenu');
      target.fire('pagehide');
      expect(keys.move).toEqual({ x: 0, y: 0 });
    });
  });
});
