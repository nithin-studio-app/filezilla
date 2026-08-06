import { palette } from "../colors";

// Percentage → color, interpolated smoothly across named stops so the bar
// visibly warms up as progress advances: dark red at 0%, through orange,
// amber, and light blue, landing on teal at 100%. Sourced from the shared
// palette rather than one-off hex picks, so this stays in sync with it.
const STOPS: [number, string][] = [
  [0, palette.red[900]],
  [25, palette.orange[400]],
  [50, palette.amber[400]],
  [75, palette.lightBlue[300]],
  [100, palette.teal[400]],
];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(hexA: string, hexB: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(hexA);
  const [br, bg, bb] = hexToRgb(hexB);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const b = Math.round(ab + (bb - ab) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

export function progressColor(pct: number): string {
  const clamped = Math.max(0, Math.min(100, pct));
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [p0, c0] = STOPS[i];
    const [p1, c1] = STOPS[i + 1];
    if (clamped <= p1) {
      return mix(c0, c1, (clamped - p0) / (p1 - p0));
    }
  }
  return STOPS[STOPS.length - 1][1];
}
