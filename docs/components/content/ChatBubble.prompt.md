Message rows for the 1:1 chat between a member and a collective (same component, both apps).

```jsx
<ChatBubble from="them" text="welcome to void. read the floor rules." time="mar 18 · 19:22" />
<ChatBubble from="me" text="can i bring a +1?" time="19:40" />
```

- `me` = right-aligned, green outline + wash. `them` = left-aligned, surface + hairline. Hard-edged (no rounded bubbles).
- Stack inside a scrolling thread; pin the composer (underline input + SEND) below.
