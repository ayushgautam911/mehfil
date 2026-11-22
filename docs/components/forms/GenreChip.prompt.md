Toggleable chip for genre/taste selection (onboarding "what moves you?") and organizer audience filters. Lay them out in a wrapping flex row with `gap: var(--sp-sm)`.

```jsx
const [sel, setSel] = useState(["acid"]);
{genres.map((g) => (
  <GenreChip key={g} label={g} selected={sel.includes(g)}
    onPress={() => toggle(g)} />
))}
```

- Labels are usually lowercase ("dub techno", "hard techno") in the member app.
- Selected = green outline, 6% green wash, green text. Unselected = hairline border, secondary-grey text.
- For non-interactive genre tags on event cards, use `Tag` (cyan, no toggle) instead.
