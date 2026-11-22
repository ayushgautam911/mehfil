Genre-affinity meter used in the profile "// FREQUENCIES" block and organizer audience breakdowns. Stack several with `var(--sp-md)` between rows.

```jsx
{freqs.map((f) => <FreqBar key={f.genre} label={f.genre} percent={f.percent} />)}
```

- Deliberately thin (2px track) — it's a readout, not a chart. Green fill on a border-grey track.
- Keep labels short; the label column is fixed-width so bars align.
