/** Test-Schnittstelle: fügt Werte zu `window.__emilia2` hinzu (nur Entwicklung oder VITE_TEST_HOOKS=1). */
export function installTestHooks(api: Record<string, unknown>): void {
  if (!(import.meta.env.DEV || import.meta.env.VITE_TEST_HOOKS === '1')) return;
  const w = window as unknown as { __emilia2?: Record<string, unknown> };
  w.__emilia2 = Object.assign(w.__emilia2 ?? {}, api);
}
