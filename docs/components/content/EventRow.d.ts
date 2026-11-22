import * as React from "react";

/** A single Hive event in the feed. */
export interface HiveEvent {
  id?: string;
  name: string;
  date?: string;
  time?: string;
  venue?: string;
  genres?: string[];
  matchScore?: number;
  isPrivate?: boolean;
}

/**
 * Feed list item — accent bar, title, match score, details, genre tags.
 *
 * @startingPoint section="Content" subtitle="Event feed card row" viewport="375x140"
 */
export interface EventRowProps {
  /** The event to render. */
  event: HiveEvent;
  /** Tap/click handler (opens detail). */
  onPress?: () => void;
  /** Style overrides merged onto the root. */
  style?: React.CSSProperties;
}

export function EventRow(props: EventRowProps): JSX.Element;
