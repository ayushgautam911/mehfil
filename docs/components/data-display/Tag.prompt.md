Read-only genre/venue label on event cards and detail screens. For interactive selection use `GenreChip` instead.

```jsx
<div style={{ display: "flex", gap: "var(--sp-xs)", flexWrap: "wrap" }}>
  {event.genres.map((g) => <Tag key={g} label={g} />)}
</div>
```

- Default cyan text inside a hairline box, no fill. Always UPPERCASE.
- Pass `color="var(--accent-primary)"` for a tag you want to read as matched/active.
