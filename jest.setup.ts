/// <reference types="node" />
import '@testing-library/jest-dom';

process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';