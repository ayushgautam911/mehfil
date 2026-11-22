import * as React from "react";

/** Centered metric — bold value over an uppercase caption. */
export interface StatBlockProps {
  /** The metric value (number or short string). */
  value: React.ReactNode;
  /** Uppercase caption beneath the value. */
  label: string;
  /** Render the value in green (e.g. Hive score). */
  accent?: boolean;
  /** Wrap the value in [brackets] readout style. */
  bracket?: boolean;
  /** Style overrides merged onto the root. */
  style?: React.CSSProperties;
}

export function StatBlock(props: StatBlockProps): JSX.Element;
