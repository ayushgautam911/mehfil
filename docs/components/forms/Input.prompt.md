Single-line text field for search and form entry. Never a boxed input — just a hairline underline that turns green on focus.

```jsx
<Input label="ARTISTS" placeholder="search..." value={q} onChange={setQ} />
```

- Optional `label` renders as an uppercase cyan micro-label above the field.
- Placeholder uses dim grey; entered text is primary. Keep placeholders lowercase ("search...").
- Stack multiple inputs with `var(--sp-lg)` between them.
