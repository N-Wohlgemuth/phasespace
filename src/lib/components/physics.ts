/**
 * physics.ts
 * Reine Effect-TS Berechnungen für den harmonischen Oszillator.
 * Keine Svelte-Abhängigkeiten – vollständig testbar.
 */

import { Effect } from 'effect';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Mode = 'lagrange' | 'hamilton' | 'both';

export type Point = {
  readonly x: number;
  readonly p: number;
};

export type SimParams = {
  readonly m:     number;
  readonly k:     number;
  readonly gamma: number;
  readonly x0:    number;
  readonly p0:    number;
};

export type TrajectoryResult = {
  readonly points: ReadonlyArray<Point>;
  readonly energy: number;
  readonly xRange: readonly [number, number];
  readonly pRange: readonly [number, number];
  readonly vRange: readonly [number, number]; // ẋ = p/m für Lagrange
};

export type EnergyResult = {
  readonly T:     number;
  readonly V:     number;
  readonly E:     number;
  readonly omega: number;
};

// ─── Effects ─────────────────────────────────────────────────────────────────

/**
 * RK4-Integration des (gedämpften) harmonischen Oszillators.
 * Gibt Trajektorie + Energiebereich als reinen Effect zurück.
 *
 * Bewegungsgleichung:
 *   ẋ = p/m
 *   ṗ = −kx − (γ/m)·p
 */
export const computeTrajectory = (
  params: SimParams,
  steps = 900
): Effect.Effect<TrajectoryResult> =>
  Effect.sync(() => {
    const { m, k, gamma, x0, p0 } = params;
    const dt = 0.04;
    const pts: Point[] = [];
    let cx = x0, cp = p0;

    // Ableitungen gemäß Hamiltonscher Gleichungen (mit Dämpfung)
    const deriv = (x: number, p: number) => ({
      dx:  p / m,
      dp: -k * x - (gamma / m) * p,
    });

    for (let i = 0; i < steps; i++) {
      pts.push({ x: cx, p: cp });

      const k1 = deriv(cx,                    cp);
      const k2 = deriv(cx + 0.5 * dt * k1.dx, cp + 0.5 * dt * k1.dp);
      const k3 = deriv(cx + 0.5 * dt * k2.dx, cp + 0.5 * dt * k2.dp);
      const k4 = deriv(cx +        dt * k3.dx, cp +        dt * k3.dp);

      cx += (dt / 6) * (k1.dx + 2 * k2.dx + 2 * k3.dx + k4.dx);
      cp += (dt / 6) * (k1.dp + 2 * k2.dp + 2 * k3.dp + k4.dp);
    }

    const energy = 0.5 * k * x0 ** 2 + 0.5 * p0 ** 2 / m;
    const amp    = Math.sqrt((2 * energy) / k) + 0.6;
    const pAmp   = Math.sqrt(2 * m * energy)   + 0.6;
    const vAmp   = Math.sqrt((2 * energy) / m) + 0.6; // ẋ = p/m Amplitude für Lagrange

    return {
      points: pts,
      energy,
      xRange: [-amp,  amp]  as const,
      pRange: [-pAmp, pAmp] as const,
      vRange: [-vAmp, vAmp] as const,
    };
  });

/**
 * Berechnet T, V, E und ω an einem einzelnen Phasenpunkt.
 *
 * Bei Dämpfung wird die gedämpfte Eigenfrequenz zurückgegeben:
 *   ω_d = √(k/m − (γ/(2m))²)
 */
export const computePointEnergy = (
  pt:     Point,
  params: SimParams
): Effect.Effect<EnergyResult> =>
  Effect.sync(() => {
    const { m, k, gamma } = params;

    const T = 0.5 * pt.p ** 2 / m;
    const V = 0.5 * k * pt.x ** 2;

    // Gedämpfte Kreisfrequenz; bleibt reell solange γ < 2√(km) (Unterdämpfung)
    const discriminant = k / m - (gamma / (2 * m)) ** 2;
    const omega = discriminant > 0 ? Math.sqrt(discriminant) : 0;

    return { T, V, E: T + V, omega };
  });