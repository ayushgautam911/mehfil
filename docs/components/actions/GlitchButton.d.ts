import * as React from "react";

/**
 * Hive's primary action button — green-outlined, uppercase, glitches on hover.
 *
 * @startingPoint section="Actions" subtitle="Primary glitch CTA button" viewport="320x120"
 */
export interface GlitchButtonProps {
  /** Button label, rendered UPPERCASE. Default "ENTER". */
  title?: string;
  /** Click handler. */
  onClick?: () => void;
  /** Disabled (dimmed, no glitch). */
  disabled?: boolean;
  /** Stretch to fill container width. */
  block?: boolean;
  /** Style overrides merged onto the root. */
  style?: React.CSSProperties;
}

export function GlitchButton(props: GlitchButtonProps): JSX.Element;
