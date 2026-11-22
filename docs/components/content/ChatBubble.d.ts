import * as React from "react";

/** One message in a 1:1 chat thread. */
export interface ChatBubbleProps {
  /** "me" (right, green) or "them" (left, surface). Default "them". */
  from?: "me" | "them";
  /** Message text. */
  text: string;
  /** Timestamp shown dim beneath the bubble. */
  time?: string;
  /** Style overrides merged onto the root. */
  style?: React.CSSProperties;
}

export function ChatBubble(props: ChatBubbleProps): JSX.Element;
