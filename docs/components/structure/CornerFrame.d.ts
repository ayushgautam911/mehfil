import * as React from "react";

/**
 * Wraps content in the signature four corner-bracket marks.
 *
 * @startingPoint section="Structure" subtitle="Corner-bracket focal frame" viewport="360x200"
 */
export interface CornerFrameProps {
  /** Content to frame. */
  children?: React.ReactNode;
  /** Bracket colour. Default green; use var(--text-dim) for a quiet frame. */
  color?: string;
  /** Bracket arm length in px. Default 12. */
  size?: number;
  /** Bracket stroke width in px. Default 1.5. */
  thickness?: number;
  /** Also draw a faint hairline border around the box. */
  bordered?: boolean;
  /** Inner padding (CSS length or token). Default var(--sp-lg). */
  padding?: string;
  /** Style overrides merged onto the root. */
  style?: React.CSSProperties;
}

export function CornerFrame(props: CornerFrameProps): JSX.Element;
