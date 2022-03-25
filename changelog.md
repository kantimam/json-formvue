# 2.0.0
- Migrated to TypeScript
- response interceptors are now registered this way:

```ts
import ResponseInterceptor from "formvue-json";

ResponseInterceptor.register(async (ctx, jsonResponse) => false)
```

# 1.12.0
- Removed 'menu' two-way-bind in extended_select and select_with_related_values as it seems to be a bad practise.
  Use '.activateMenu()', '.blur()' and '.isMenuActive' instead
