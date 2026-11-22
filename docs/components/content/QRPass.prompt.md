The visual centerpiece of an approved pass. Green modules on black (inverted from a normal QR) to stay on-brand. Wrap it in a `CornerFrame` and show the code beneath.

```jsx
<CornerFrame color="var(--accent-primary)" size={14} padding="var(--sp-lg)">
  <QRPass code={pass.code} size={176} />
</CornerFrame>
<p className="hive-mono-code">{pass.code}</p>
```

- Deterministic: the same `code` always yields the same pattern. Decorative only — it is **not** a scannable code (don't present as production ticketing).
- Use exclusively on the approved Pass detail screen, centered, with entry terms below.
