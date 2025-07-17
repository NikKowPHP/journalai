Of course. I will implement a more robust API key selection mechanism to address the challenges of a serverless environment. The current sequential rotation can be problematic, as new serverless instances may always start with the first key.

To solve this, I will modify the key provider to expose all available keys and update the Gemini service to randomly shuffle these keys before attempting a request. This ensures better load distribution and resilience, as it randomizes the starting key for each invocation while still systematically trying all other keys upon failure.

Here are the updated files:

### src/lib/ai/gemini-key-provider.ts
```typescript

```

### src/lib/ai/gemini-service.ts
```typescript

```

### src/lib/ai/gemini-service-rotation.test.ts
```typescript
```