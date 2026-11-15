import type { Services } from '../core/services';
import { HP_PER_HEART, MAX_LEVEL, xpToNext } from '../core/levels';
import { QUEST_GIVERS } from '../data/quests';
import { TEXTS, fillText } from '../data/texts';
import { heartQuarters, maxHp } from '../systems/progress';
import { currentQuest } from '../systems/quests';
import { el } from './el';
import { snapSize } from './grid';
import { faceUrl } from './images';
import coinUrl from '../assets/gfx/ui/muenze.png?url';
// Baukasten vor hud.css: gleich spezifische Regeln aus hud.css (etwa der Innenabstand einer Tafel) gelten nur,
// wenn kit.css vorher geladen ist – auch wenn dieses Modul vor root.ts geladen wird (etwa über WorldScene).
import './kit.css';
import './hud.css';

/** Zahl für die Vorlese-Beschriftung, deutsch (2,25). */
const number = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 });

/**
 * Die Grundanzeige (Spec 10): oben links Herzen, darunter Level mit Fortschrittsbalken und Münzen; oben rechts die
 * aktuelle Aufgabe mit dem Gesicht ihres Gebers und der Menü-Knopf. Liegt als `div.hud` direkt in der Wurzel der
 * Oberfläche (so macht der Fenster-Verwalter sie bei offenem Fenster `inert`). Zeichnet nur bei `stats:changed`
 * und `quest:changed` neu.
 */
export class Hud {
  /** Ruft der Menü-Knopf; das Menü hängt Task 9 hier ein. */
  onMenu: (() => void) | null = null;

  private readonly element: HTMLElement;
  private readonly hearts: HTMLElement;
  private readonly levelNum: HTMLElement;
  private readonly levelFill: HTMLElement;
  private readonly level: HTMLElement;
  private readonly row: HTMLElement;
  private readonly coins: HTMLElement;
  private readonly coinNum: HTMLElement;
  private readonly quest: HTMLElement;
  private readonly questFace: HTMLImageElement;
  private readonly questName: HTMLElement;
  private readonly questDesc: HTMLElement;
  private readonly questCount: HTMLElement;
  private readonly unsubscribe: Array<() => void>;

  constructor(root: HTMLElement, private readonly services: Services) {
    this.element = el('div', 'hud');

    const stats = el('div', 'hud-stats');
    this.hearts = el('div', 'hud-hearts');
    this.hearts.setAttribute('role', 'img');
    const row = el('div', 'hud-row ui-panel');
    this.row = row;
    this.level = el('div', 'hud-level');
    this.level.setAttribute('role', 'img');
    this.levelNum = el('span', 'hud-level__num');
    this.levelNum.setAttribute('aria-hidden', 'true');
    const bar = el('div', 'hud-level__bar');
    bar.setAttribute('aria-hidden', 'true');
    this.levelFill = el('div', 'hud-level__fill');
    bar.appendChild(this.levelFill);
    this.level.append(this.levelNum, bar);
    this.coins = el('div', 'hud-coins');
    this.coins.setAttribute('role', 'img');
    const coinImg = el('img', 'hud-coins__img');
    coinImg.src = coinUrl;
    coinImg.alt = '';
    coinImg.draggable = false;
    this.coinNum = el('span', 'hud-coins__num');
    this.coinNum.setAttribute('aria-hidden', 'true');
    this.coins.append(coinImg, this.coinNum);
    row.append(this.level, this.coins);
    stats.append(this.hearts, row);

    const corner = el('div', 'hud-corner');
    this.quest = el('section', 'hud-quest ui-panel');
    this.quest.setAttribute('aria-label', TEXTS['hud.quest']);
    this.questFace = el('img', 'hud-quest__face');
    this.questFace.alt = '';
    this.questFace.draggable = false;
    const text = el('div', 'hud-quest__text');
    this.questName = el('p', 'hud-quest__name');
    this.questDesc = el('p', 'hud-quest__desc');
    this.questCount = el('p', 'hud-quest__count');
    text.append(this.questName, this.questDesc);
    this.quest.append(this.questFace, text);
    const menu = el('button', 'ui-button hud-menu', TEXTS['hud.menu']);
    menu.type = 'button';
    menu.setAttribute('aria-label', TEXTS['hud.menu']);
    menu.addEventListener('click', () => this.onMenu?.());
    corner.append(this.quest, menu);

    this.element.append(stats, corner);
    root.appendChild(this.element);

    const { bus } = services;
    this.unsubscribe = [
      bus.on('stats:changed', () => this.refresh()),
      bus.on('quest:changed', () => this.refresh()),
      // neuer Maßstab: Tafeln wieder auf ganze Bildpunkte
      services.pixelGrid.onChange(() => this.snapPanels()),
    ];
    // Schriften laden später nach und ändern die Größe der Tafeln
    void document.fonts?.ready.then(() => this.snapPanels());
    this.refresh();
  }

  refresh(): void {
    const { state } = this.services;
    this.renderHearts();
    const { level, xp } = state.progression;
    this.levelNum.textContent = String(level);
    this.level.setAttribute('aria-label', fillText('hud.level', { n: level }));
    const need = xpToNext(level);
    const share = level >= MAX_LEVEL ? 1 : Math.min(1, Math.max(0, xp / need));
    this.levelFill.style.width = `${share * 100}%`;
    const coins = state.inventory.coins;
    this.coinNum.textContent = String(coins);
    this.coins.setAttribute('aria-label', fillText('hud.coins', { n: coins }));
    this.renderQuest();
    this.snapPanels();
  }

  /** Tafeln richten sich nach ihrem Inhalt: Größe auf ganze Bildpunkte (grid.ts), sonst wird ihr Rand unscharf. */
  private snapPanels(): void {
    snapSize(this.row);
    if (!this.quest.hidden) snapSize(this.quest);
  }

  destroy(): void {
    for (const off of this.unsubscribe) off();
    this.element.remove();
  }

  private renderHearts(): void {
    const { state } = this.services;
    const quarters = heartQuarters(state);
    while (this.hearts.children.length > quarters.length) this.hearts.lastElementChild!.remove();
    while (this.hearts.children.length < quarters.length) {
      const heart = el('span', 'hud-heart');
      heart.style.setProperty('--i', String(this.hearts.children.length));
      this.hearts.appendChild(heart);
    }
    this.hearts.style.setProperty('--count', String(quarters.length));
    quarters.forEach((q, i) => { (this.hearts.children[i] as HTMLElement).dataset.quarters = String(q); });
    const hp = Math.min(maxHp(state), Math.max(0, Math.floor(state.player.hp)));
    this.hearts.setAttribute('aria-label', fillText('hud.hearts', { n: number.format(hp / HP_PER_HEART), max: quarters.length }));
  }

  private renderQuest(): void {
    const current = currentQuest(this.services.state);
    this.quest.hidden = current === null;
    if (!current) return;
    const { def, progress } = current;
    const face = faceUrl(QUEST_GIVERS[def.id]);
    this.questFace.hidden = face === null;
    if (face !== null && this.questFace.getAttribute('src') !== face) this.questFace.src = face;
    this.questName.textContent = def.name;
    this.questDesc.textContent = def.description;
    if (def.count > 1) {
      this.questCount.textContent = `${Math.min(progress, def.count)}/${def.count}`;
      if (!this.questCount.isConnected) this.questDesc.after(this.questCount);
    } else {
      this.questCount.remove();
    }
  }
}
