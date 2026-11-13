import { it, expect } from 'vitest';
import { MOB_RESPAWN_SECONDS } from '../../src/utils/Constants.js';
it('Gegner brauchen drei Minuten', () => { expect(MOB_RESPAWN_SECONDS).toBe(180); });
