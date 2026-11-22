The feed's relevance signal — a big green percentage over a small caption, pinned to the top-right of an event card.

```jsx
<MatchScore value={event.matchScore} />
<MatchScore value={87} caption="SCORE" />
```

- Reads as a sensor output: bold green number, dimmed uppercase caption.
- Right-align (default) in card headers; `align="center"` works in standalone stat blocks.
