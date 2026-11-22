import * as React from "react";

/**
 * Toggleable genre filter chip. Selected = green outline + wash + green text.
 *
 * @startingPoint section="Forms" subtitle="Selectable genre filter chips" viewport="360x160"
 */
export interface GenreChipProps {
  /** Chip text (genre name, usually lowercase e.g. "hard techno"). */
  label: string;
  /** Selected/active state. */
  selected?: boolean;
  /** Toggle handler. */
  onPress?: () => void;
  /** Style overrides merged onto the root. */
  style?: React.CSSProperties;
}

export function GenreChip(props: GenreChipProps): JSX.Element;
