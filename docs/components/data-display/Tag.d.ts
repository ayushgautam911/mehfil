import * as React from "react";

/** Non-interactive bordered genre/venue tag (cyan uppercase micro-text). */
export interface TagProps {
  /** Tag text, rendered UPPERCASE. */
  label: string;
  /** Text colour. Default cyan. Use green to signal a match/active tag. */
  color?: string;
  /** Style overrides merged onto the root. */
  style?: React.CSSProperties;
}

export function Tag(props: TagProps): JSX.Element;
