The system's state language — one component for every status across the product (passes, memberships, applications, events, members).

```jsx
<StatusBadge status="approved" />   {/* green */}
<StatusBadge status="pending" />    {/* cyan  */}
<StatusBadge status="blocked" />    {/* grey  */}
```

- Renders `[STATUS]` in the readout style. Colour is automatic: positive/active → green, in-progress → cyan, negative/inactive → grey. The palette has **no red** — declined/blocked stay grey, by design.
- For a bordered membership flag (e.g. PRIVATE) use `Badge` with `variant="outline"` instead.
