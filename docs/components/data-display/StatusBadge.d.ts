import * as React from "react";

/** Bracketed [status] readout, colour-coded by state word. */
export interface StatusBadgeProps {
  /** State word, e.g. "approved" | "pending" | "invited" | "blocked" | "draft" | "used". */
  status: string;
  /** Style overrides merged onto the root. */
  style?: React.CSSProperties;
}

export function StatusBadge(props: StatusBadgeProps): JSX.Element;
