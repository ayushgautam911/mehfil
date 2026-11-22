import * as React from "react";

/**
 * Underlined single-line text input. Hairline bottom rule, green on focus.
 */
export interface InputProps {
  /** Controlled value. */
  value?: string;
  /** Change handler, receives the raw string. */
  onChange?: (value: string) => void;
  /** Placeholder text (dim). Default "search...". */
  placeholder?: string;
  /** Optional uppercase cyan label above the field. */
  label?: string;
  /** Input type. Default "text". */
  type?: string;
  /** Style overrides merged onto the wrapper. */
  style?: React.CSSProperties;
}

export function Input(props: InputProps): JSX.Element;
