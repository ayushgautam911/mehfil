The primary call-to-action across Hive — use for ENTER, CONTINUE, GET TICKETS, ACCEPT, ISSUE PASS. One per view, max.

```jsx
<GlitchButton title="GET TICKETS" onClick={buy} />
<GlitchButton title="CONTINUE" block style={{ marginTop: "var(--sp-xl)" }} />
<GlitchButton title="ISSUE PASS" disabled />
```

- Hard-edged (no radius), green outline on a faint green wash. On hover it inverts to a solid-green fill with black text, the label becomes `! LABEL !`, and it jitters one frame.
- Idle label gets a trailing `›`. Keep titles short and UPPERCASE.
- `block` stretches full width (forms, mobile). Pair with `var(--sp-xl)` top margin when it closes a screen.
- For low-emphasis actions (REFER A FRIEND, COPY) use a plain cyan text link, not this.
