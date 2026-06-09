---
trigger: manual
description: When working on ui modification and generation
---

When working on apps/native ui, prioritize using components found in components/ui over react-native and other library components.

Most components have presets ge Text/Typography has type prop. Always prefer presets to verbose styling and classNames

Minimize and reduce boiler code and unnecessary View nestings

Always adhere to clean code. Extract repeatitive UI into an array of objects and follow DRY principle