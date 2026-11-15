import { afterEach, describe, it, expect, vi } from 'vitest';
import {
  BACKUP_FIRST_REMIND_SECONDS, BACKUP_REMIND_DAYS, REVOKE_DELAY_MS, backupFilename, downloadText, shouldRemind,
} from '../../src/save/file';
import { createNewGameState } from '../../src/core/state';

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date(2026, 10, 13, 15, 30).getTime();

describe('Werte der Sicherung als Datei', () => {
  it('wie im Auftrag: 7 Tage, 30 Minuten, Adresse 60 s gültig (Alt: src/utils/SaveExport.js, Zeilen 5–6)', () => {
    expect(BACKUP_REMIND_DAYS).toBe(7);
    expect(BACKUP_FIRST_REMIND_SECONDS).toBe(1800);
    expect(REVOKE_DELAY_MS).toBe(60_000);
  });
});

describe('backupFilename', () => {
  it('aus dem lokalen Datum, Monat und Tag zweistellig', () => {
    expect(backupFilename(new Date(2026, 10, 13))).toBe('emilia2-spielstand-2026-11-13.json');
    expect(backupFilename(new Date(2027, 0, 5, 23, 59))).toBe('emilia2-spielstand-2027-01-05.json');
  });
});

describe('shouldRemind', () => {
  function state(totalTime: number, lastBackupAt: number | null) {
    const s = createNewGameState(NOW);
    s.dayNight.totalTime = totalTime;
    s.lastBackupAt = lastBackupAt;
    return s;
  }

  it('neues Spiel: nein', () => {
    expect(createNewGameState(NOW).lastBackupAt).toBeNull();
    expect(shouldRemind(createNewGameState(NOW), NOW)).toBe(false);
  });

  it('nie gesichert: erst ab 30 Minuten Spielzeit', () => {
    expect(shouldRemind(state(1799, null), NOW)).toBe(false);
    expect(shouldRemind(state(1800, null), NOW)).toBe(true);
  });

  it('gestern gesichert: nein, auch nach langer Spielzeit', () => {
    expect(shouldRemind(state(1800, NOW - DAY_MS), NOW)).toBe(false);
    expect(shouldRemind(state(99_999, NOW - DAY_MS), NOW)).toBe(false);
  });

  it('vor genau 7 Tagen gesichert: noch nicht, vor 8 Tagen: ja', () => {
    expect(shouldRemind(state(0, NOW - 7 * DAY_MS), NOW)).toBe(false);
    expect(shouldRemind(state(0, NOW - 8 * DAY_MS), NOW)).toBe(true);
  });

  it('Sicherung in der Zukunft (Uhr verstellt): nein', () => {
    expect(shouldRemind(state(1800, NOW + DAY_MS), NOW)).toBe(false);
    expect(shouldRemind(state(1800, NOW + 30 * DAY_MS), NOW)).toBe(false);
  });
});

describe('downloadText', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  /** Ein Dokument mit genau dem, was downloadText braucht; schreibt mit, was mit dem Link geschieht. */
  function fakeDocument() {
    const log: string[] = [];
    const link = {
      href: '', download: '', style: { display: '' },
      click: vi.fn(() => { log.push(`click:${link.download}:${link.href}:${link.style.display}`); }),
      remove: vi.fn(() => { log.push('remove'); }),
    };
    const doc = {
      createElement: vi.fn((tag: string) => { log.push(`create:${tag}`); return link; }),
      body: { appendChild: vi.fn(() => { log.push('append'); }) },
    };
    return { log, link, doc: doc as unknown as Document };
  }

  it('Blob mit dem Text, unsichtbarer Link mit download-Name, geklickt und entfernt; Adresse erst nach 60 s frei', async () => {
    vi.useFakeTimers();
    const blobs: Blob[] = [];
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => { blobs.push(blob as Blob); return 'blob:probe'; });
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const { log, doc } = fakeDocument();

    downloadText(doc, 'emilia2-spielstand-2026-11-13.json', '{"formatVersion":1}');

    expect(log).toEqual(['create:a', 'append', 'click:emilia2-spielstand-2026-11-13.json:blob:probe:none', 'remove']);
    expect(blobs).toHaveLength(1);
    expect(blobs[0]!.type).toBe('application/json');
    expect(await blobs[0]!.text()).toBe('{"formatVersion":1}');
    vi.advanceTimersByTime(REVOKE_DELAY_MS - 1);
    expect(revoke).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(revoke).toHaveBeenCalledWith('blob:probe');
  });
});
