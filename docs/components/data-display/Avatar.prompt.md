Identity tile for collectives and members — there are no photo avatars in Hive; a bold monogram on a dark square is the brand-correct stand-in.

```jsx
<Avatar name="VOID" size={40} />
<Avatar name="@cybernaut" size={28} />
<Avatar name="NULL SECTOR" glow color="var(--accent-secondary)" />  {/* invited */}
```

- Initials are derived automatically (`@void.collective` → `VO`). Keep to 2 letters.
- `glow` = active/unread/approved (green) — use cyan `color` for an invited/pending accent.
- Pair with `ListRow` for member/collective/chat lists.
