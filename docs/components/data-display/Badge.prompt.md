Status flags and inline readouts. Two looks for two jobs:

```jsx
<Badge label="PRIVATE" />                       {/* outlined green pill */}
<Badge label="LOCKED — PASS REQUIRED" variant="bracket" />
<Badge label="QR" variant="bracket" />
<Badge label="SOLD OUT" variant="bracket" tone="dim" />
```

- `outline` for membership/visibility flags pinned next to a title (PRIVATE).
- `bracket` for the machine-readout style Hive uses everywhere — `[92% MATCH]`, `[LOCKED]`, `[QR]`. Don't include the brackets in `label`; they're added.
- Tones: green = active/positive, cyan = informational, dim = inactive/sold-out.
