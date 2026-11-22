import * as React from "react";

/** Two-line green percentage readout (value% over a caption). */
export interface MatchScoreProps {
  /** Percentage value (0–100). Default 92. */
  value?: number;
  /** Caption under the number. Default "MATCH". */
  caption?: string;
  /** Cross-axis alignment. Default "flex-end" (right-aligned). */
  align?: "flex-start" | "center" | "flex-end";
  /** Style overrides merged onto the root. */
  style?: React.CSSProperties;
}

export function MatchScore(props: MatchScoreProps): JSX.Element;
