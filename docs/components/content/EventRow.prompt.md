The core unit of the feed — render a list of these on the FEED screen, separated by their own hairline rules (no extra dividers needed).

```jsx
{events.map((e) => (
  <EventRow key={e.id} event={e} onPress={() => open(e.id)} />
))}
```

- Borderless by design: a faint green accent bar on the left + a bottom hairline is the only chrome. Don't wrap it in a card box.
- Title is auto-uppercased. Pass `isPrivate` to show the PRIVATE flag; omit `matchScore` to hide the match readout.
- Keep the details line to `date · time · venue`. Genres render as cyan tags.
