---
trigger: glob
description: When working on ui modification and generation
globs: apps/native/**/*
---

When working on apps/native ui, prioritize using components found in components/ui over react-native and other library components.

## Component Styling Rules

### Buttons (`Button`, `LinkButton`)

- **Use variant props** (`appearance`, `color`, `size`, `inverted`) instead of verbose classNames. Most visual styles (colors, text colors, borders, backgrounds, alignment) are already provided by variants.
- **Only use classNames for layout concerns** like `w-full`, `flex-1`, `mt-2`, etc. Never repeat styles that variants already provide (e.g. `items-center justify-center`, `rounded-md`, `text-white`, `border border-border`, `font-bold`).
- **Buttons auto-wrap string children** in `ButtonLabel`, so `<Button.Label>` is unnecessary for plain text. Use direct children: `<Button>Submit</Button>` instead of `<Button><Button.Label>Submit</Button.Label></Button>`. Only use `<Button.Label>` when you need custom styling on the label alongside other children like icons.
- **Use `appearance` not `variant`** for the CVA-based visual style. The `variant` prop maps to HeroUI's native prop and is separate from our custom `appearance` (solid, outline, ghost, link, soft).
- **Don't use `Pressable` when `Button` fits.** If something looks and behaves like a button (text + optional icon, has onPress), use `<Button appearance="ghost">` or `<Button appearance="link">` instead of `<Pressable>` with manual styling.

### Text / Typography

- `Text` has a `type` prop (e.g. `h1`, `h2`, `h3`, `body-sm`, `body-xs`). Always prefer type presets to verbose styling and classNames.
- Only add classNames for properties not covered by the type preset (e.g. `text-center`, `text-primary`, colors).

### General

- **Minimize and reduce boiler code and unnecessary View nestings.**
- Always adhere to clean code. Extract repetitive UI into an array of objects and follow DRY principle.
- Prefer using component props and variants over manually applying the same className patterns across multiple usages. If a className pattern is repeated, consider modifying the parent component's defaults instead.