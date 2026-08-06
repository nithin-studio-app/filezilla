import { progressColor } from "./progressColor";
import { accent, palette } from "../colors";
import "./ProgressBar.css";

export interface RingProgressBarProps {
  variant?: "ring";
  pct: number;
  /** Outer diameter in rem. */
  size?: number;
  /** Overrides the percentage-interpolated color (e.g. for an error state). */
  color?: string;
  "aria-label"?: string;
}

export interface LinearProgressBarProps {
  variant: "linear";
  pct: number;
  /** Track height in rem. */
  height?: number;
  /** Overrides the percentage-interpolated color (e.g. for an error state). */
  color?: string;
  /** Show the "N%" label next to the track. */
  showLabel?: boolean;
  "aria-label"?: string;
}

export interface SegmentedProgressBarProps {
  variant: "segmented";
  /** Total number of segments. */
  segments: number;
  /** How many segments are filled. */
  completed: number;
  /** Overrides the percentage-interpolated color (e.g. for an error state). */
  color?: string;
  height?: number;
  gap?: number;
  "aria-label"?: string;
}

export interface IndeterminateProgressBarProps {
  variant: "indeterminate";
  height?: number;
  color?: string;
  "aria-label"?: string;
}

export interface GaugeProgressBarProps {
  variant: "gauge";
  pct: number;
  /** Width in rem (the gauge is a half-circle, so it's about half as tall). */
  size?: number;
  color?: string;
  showLabel?: boolean;
  "aria-label"?: string;
}

export interface StackedProgressBarSegment {
  pct: number;
  color?: string;
  label?: string;
}

export interface StackedProgressBarProps {
  variant: "stacked";
  /** Proportions of the whole, rendered left-to-right in order. Should sum to <= 100. */
  segments: StackedProgressBarSegment[];
  height?: number;
  "aria-label"?: string;
}

export type ProgressBarProps =
  | RingProgressBarProps
  | LinearProgressBarProps
  | SegmentedProgressBarProps
  | IndeterminateProgressBarProps
  | GaugeProgressBarProps
  | StackedProgressBarProps;

export function ProgressBar(props: ProgressBarProps) {
  switch (props.variant) {
    case "linear":
      return <LinearProgressBar {...props} />;
    case "segmented":
      return <SegmentedProgressBar {...props} />;
    case "indeterminate":
      return <IndeterminateProgressBar {...props} />;
    case "gauge":
      return <GaugeProgressBar {...props} />;
    case "stacked":
      return <StackedProgressBar {...props} />;
    default:
      return <RingProgressBar {...props} />;
  }
}

function RingProgressBar({ pct, size = 4.5, color, ...rest }: RingProgressBarProps) {
  const ringColor = color ?? progressColor(pct);
  const innerSize = size * 0.78;

  return (
    <div
      className="progress-bar-ring"
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        width: `${size}rem`,
        height: `${size}rem`,
        background: `conic-gradient(${ringColor} ${pct * 3.6}deg, #e1e4e8 0deg)`,
      }}
      aria-label={rest["aria-label"] ?? "Progress"}
    >
      <div className="progress-bar-ring-inner" style={{ width: `${innerSize}rem`, height: `${innerSize}rem` }}>
        <span className="progress-bar-ring-pct">{Math.round(pct)}%</span>
      </div>
    </div>
  );
}

function LinearProgressBar({ pct, height = 0.6, color, showLabel = false, ...rest }: LinearProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, pct));
  const fillColor = color ?? progressColor(clamped);

  return (
    <div className="progress-bar-linear-row">
      <div
        className="progress-bar-linear-track"
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ height: `${height}rem` }}
        aria-label={rest["aria-label"] ?? "Progress"}
      >
        <div className="progress-bar-linear-fill" style={{ width: `${clamped}%`, background: fillColor }} />
      </div>
      {showLabel && <span className="progress-bar-linear-label">{Math.round(clamped)}%</span>}
    </div>
  );
}

function SegmentedProgressBar({
  segments,
  completed,
  color,
  height = 0.6,
  gap = 0.35,
  ...rest
}: SegmentedProgressBarProps) {
  const clampedCompleted = Math.max(0, Math.min(segments, completed));
  const pct = segments === 0 ? 0 : (clampedCompleted / segments) * 100;
  const fillColor = color ?? progressColor(pct);

  return (
    <div
      className="progress-bar-segmented"
      role="progressbar"
      aria-valuenow={clampedCompleted}
      aria-valuemin={0}
      aria-valuemax={segments}
      style={{ gap: `${gap}rem` }}
      aria-label={rest["aria-label"] ?? "Progress"}
    >
      {Array.from({ length: segments }, (_, i) => (
        <div
          key={i}
          className="progress-bar-segment"
          style={{
            height: `${height}rem`,
            background: i < clampedCompleted ? fillColor : "#e1e4e8",
          }}
        />
      ))}
    </div>
  );
}

function IndeterminateProgressBar({ height = 0.6, color, ...rest }: IndeterminateProgressBarProps) {
  return (
    <div
      className="progress-bar-linear-track"
      role="progressbar"
      aria-label={rest["aria-label"] ?? "Loading"}
      style={{ height: `${height}rem` }}
    >
      <div className="progress-bar-indeterminate-fill" style={{ background: color ?? palette.blue.A200 }} />
    </div>
  );
}

function GaugeProgressBar({ pct, size = 6, color, showLabel = true, ...rest }: GaugeProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, pct));
  const strokeColor = color ?? progressColor(clamped);
  const r = 45;
  const circumference = Math.PI * r;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div
      className="progress-bar-gauge"
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{ width: `${size}rem` }}
      aria-label={rest["aria-label"] ?? "Progress"}
    >
      <svg viewBox="0 0 100 55" className="progress-bar-gauge-svg">
        <path d="M 5 50 A 45 45 0 1 1 95 50" fill="none" stroke="#e1e4e8" strokeWidth="8" strokeLinecap="round" />
        <path
          d="M 5 50 A 45 45 0 1 1 95 50"
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {showLabel && <span className="progress-bar-gauge-pct">{Math.round(clamped)}%</span>}
    </div>
  );
}

function StackedProgressBar({ segments, height = 0.6, ...rest }: StackedProgressBarProps) {
  const fallbackColors = [accent.success, palette.blue.A200, accent.error];
  const total = Math.round(segments.reduce((sum, segment) => sum + Math.max(0, segment.pct), 0));

  return (
    <div
      className="progress-bar-linear-track progress-bar-stacked"
      role="progressbar"
      aria-valuenow={total}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{ height: `${height}rem` }}
      aria-label={rest["aria-label"] ?? "Progress"}
    >
      {segments.map((segment, i) => (
        <div
          key={i}
          title={segment.label}
          style={{
            width: `${Math.max(0, segment.pct)}%`,
            background: segment.color ?? fallbackColors[i % fallbackColors.length],
            height: "100%",
          }}
        />
      ))}
    </div>
  );
}
