import * as React from "react";

/** Square monogram tile for a collective or member. */
export interface AvatarProps {
  /** Name/handle — initials are derived from it (strips a leading @). */
  name: string;
  /** Pixel size (square). Default 40. */
  size?: number;
  /** Accent border + phosphor glow (unread / active / approved). */
  glow?: boolean;
  /** Monogram + glow colour. Default green. Pass cyan for invited state. */
  color?: string;
  /** Style overrides merged onto the root. */
  style?: React.CSSProperties;
}

export function Avatar(props: AvatarProps): JSX.Element;
