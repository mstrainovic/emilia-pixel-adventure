// Die einzige Stelle, die window.localStorage anfasst. Schon der Zugriff darauf kann werfen
// (privater Modus, gesperrte Website-Daten); dann kommt ein Speicher zurück, der beim Benutzen wirft,
// damit SaveStore ihn wie jeden anderen kaputten Speicher als „nicht verfügbar" meldet.

export function openBrowserStorage(win: { readonly localStorage: Storage }): Pick<Storage, 'getItem' | 'setItem'> {
  try {
    const storage = win.localStorage;
    return {
      getItem: (key: string): string | null => storage.getItem(key),
      setItem: (key: string, value: string): void => { storage.setItem(key, value); },
    };
  } catch (error) {
    return {
      getItem: (): string | null => { throw error; },
      setItem: (): void => { throw error; },
    };
  }
}
