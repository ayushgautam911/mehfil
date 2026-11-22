Introduces every content block on a screen — LINEUP, LOCATION, TICKETS, FREQUENCIES, HISTORY, UPCOMING, ARCHIVE.

```jsx
<SectionLabel>LINEUP</SectionLabel>
<SectionLabel tone="cyan" slash={false}>YOUR REFERRAL CODE</SectionLabel>
```

- Green with a leading `// ` is the default and most common form.
- Set `slash={false}` and `tone="cyan"` for softer, form-style labels (onboarding, invite).
- Give it `margin-top: var(--sp-xl)` between sections and `var(--sp-md)` below before the content.
