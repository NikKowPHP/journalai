### .env.test
```
# This file is used for Playwright E2E tests.
#
# Before running tests, ensure the database container is running:
# docker-compose up -d db

# Point to the local PostgreSQL database running in Docker
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/prepai?schema=public"

# --- IMPORTANT ---
# You MUST provide credentials for a TEST Supabase project below.
# E2E tests require a real Supabase project for authentication.
# It is STRONGLY recommended to create a separate project for testing.
# In your test project's auth settings, you MUST disable "Enable email confirmation".
NEXT_PUBLIC_SUPABASE_URL="https://your-test-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-test-project-anon-key"

# Credentials for the pre-existing test user in your TEST Supabase project.
# This user must be created manually once in your Supabase dashboard.
TEST_USER_EMAIL="test@example.com"
TEST_USER_PASSWORD="PasswordForTesting123!"

# Encryption key for tests
APP_ENCRYPTION_KEY="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
```
### e2e/auth.spec.ts
```typescript
```
### package.json
```json
```
### playwright.config.ts
```typescript
```