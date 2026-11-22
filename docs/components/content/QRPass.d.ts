import * as React from "react";

/** Decorative phosphor-green QR for an approved entry pass (not scannable). */
export interface QRPassProps {
  /** Pass code — seeds the deterministic module pattern. */
  code: string;
  /** Pixel size (square). Default 176. */
  size?: number;
  /** Style overrides merged onto the root. */
  style?: React.CSSProperties;
}

export function QRPass(props: QRPassProps): JSX.Element;
