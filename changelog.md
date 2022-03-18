# 2.0.0
- Migrated to TypeScript
- response interceptors are now registered this way:

```ts
import ResponseInterceptor from "formvue-json";

ResponseInterceptor.register(async (ctx, jsonResponse) => false)
```
