import * as React from "react";

/** Terse status flag — outlined (PRIVATE) or bracketed readout ([LOCKED]). */
export interface BadgeProps {
  /** Label text (no brackets — added automatically for the bracket variant). */
  label: string;
  /** "outline" = bordered pill, "bracket" = [text] readout. Default "outline". */
  variant?: "outline" | "bracket";
  /** Colour tone. Default "green". */
  tone?: "green" | "cyan" | "dim" | "secondary";
  /** Style overrides merged onto the root. */
  style?: React.CSSProperties;
}

export function Badge(props: BadgeProps): JSX.Element;
