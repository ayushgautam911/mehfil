import * as React from "react";

/** Thin labelled meter for genre-breakdown bars (profile "frequencies"). */
export interface FreqBarProps {
  /** Left-hand label (genre name), rendered UPPERCASE. */
  label: string;
  /** Fill percentage (0–100). */
  percent?: number;
  /** Style overrides merged onto the row. */
  style?: React.CSSProperties;
}

export function FreqBar(props: FreqBarProps): JSX.Element;
