import * as React from "react";

/** "// LABEL" section header — green uppercase micro-text. */
export interface SectionLabelProps {
  /** Label text. */
  children: React.ReactNode;
  /** Colour tone. Default "green". */
  tone?: "green" | "cyan";
  /** Prefix with "// ". Default true. */
  slash?: boolean;
  /** Style overrides merged onto the root. */
  style?: React.CSSProperties;
}

export function SectionLabel(props: SectionLabelProps): JSX.Element;
