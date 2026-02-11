import { test, describe, expect, vi, beforeEach } from 'vitest';
import { authService } from './src/shared/lib/auth-service';

// Mock the supabase client and other dependencies
vi.mock('./src/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn()
    }
  }
}));

vi.mock('./src/lib/security-manager', () => ({
  securityManager: {
    secureRegister: vi.fn(),
    secureLogin: vi.fn()
  }
}));

vi.mock('./src/lib/error-handler', () => ({
  errorHandler: {
    handle: vi.fn()
  }
}));

describe('Security-Enhanced Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should validate email format during signup', async () => {
    const invalidResult = await authService.signUp({
      email: 'invalid-email',
      password: 'ValidPass123!',
      full_name: 'Test User',
      user_name: 'testuser'
    });

    expect(invalidResult.error).toContain('Email format is invalid');
  });

  test('should validate password strength during signup', async () => {
    const weakPasswordResult = await authService.signUp({
      email: 'test@example.com',
      password: 'weak',
      full_name: 'Test User',
      user_name: 'testuser'
    });

    expect(weakPasswordResult.error).toContain('Password does not meet security requirements');
  });

  test('should validate full name length during signup', async () => {
    const shortNameResult = await authService.signUp({
      email: 'test@example.com',
      password: 'ValidPass123!',
      full_name: 'A',
      user_name: 'testuser'
    });

    expect(shortNameResult.error).toContain('Full name is too short');
  });

  test('should validate username length during signup', async () => {
    const shortUsernameResult = await authService.signUp({
      email: 'test@example.com',
      password: 'ValidPass123!',
      full_name: 'Test User',
      user_name: 'ab'
    });

    expect(shortUsernameResult.error).toContain('Username is too short');
  });

  test('should allow valid signup data', async () => {
    const mockUserData = {
      user: { id: 'test-user-id', email: 'test@example.com' },
      session: { access_token: 'test-token' },
      error: null
    };

    // Mock successful registration
    vi.spyOn(require('./src/lib/security-manager').securityManager, 'secureRegister')
      .mockResolvedValue(mockUserData);

    const validResult = await authService.signUp({
      email: 'test@example.com',
      password: 'ValidPass123!',
      full_name: 'Test User',
      user_name: 'testuser123'
    });

    expect(validResult.error).toBeNull();
    expect(validResult.user).toBeDefined();
  });

  test('should validate email format during sign in', async () => {
    const result = await authService.signIn('invalid-email', 'password');

    expect(result.error).toContain('Email format is invalid');
  });

  test('should require password during sign in', async () => {
    const result = await authService.signIn('test@example.com', '');

    expect(result.error).toContain('Password is required');
  });
});

// Export for manual testing
export default {
  test,
  describe,
  expect
};