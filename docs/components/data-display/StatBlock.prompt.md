Single metric in a stats row (profile: EVENTS / REFERRED / SCORE; organizer analytics: PASSES / RETURNING / NEW). Separate items with a thin vertical rule.

```jsx
<StatBlock value={12} label="EVENTS" />
<StatBlock value={87} label="SCORE" accent bracket />
```

- `accent` greens the number; `bracket` wraps it as `[87]` for the score/credibility readout.
- Lay out in a flex row with `flex:1` per block and a 1px × 30px `var(--border-hairline)` divider between them.
