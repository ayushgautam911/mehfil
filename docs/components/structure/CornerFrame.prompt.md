Marks a focal block with the Hive corner brackets — the wordmark lockup, an event title block, a scanner target, a hero readout.

```jsx
<CornerFrame color="var(--text-dim)" padding="var(--sp-xl) var(--sp-xxl)">
  <h1 className="hive-wordmark">H I V E</h1>
</CornerFrame>

<CornerFrame bordered>
  <Badge label="92% MATCH" variant="bracket" />
  <h2>VOID: WAREHOUSE SESSION</h2>
</CornerFrame>
```

- Brackets only suggest a frame — they don't enclose. Use sparingly, on the single most important block per screen.
- Green brackets for active/primary focus; `var(--text-dim)` when the framed content already glows (e.g. behind the green wordmark) so the brackets recede.
- `bordered` adds a hairline box for detail/title blocks.
