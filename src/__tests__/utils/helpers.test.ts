import {
  formatTimestamp,
  isProduction,
  isDevelopment,
  getEnvVar,
  sanitizeErrorMessage,
  delay,
  generateRandomString,
} from '../../utils/helpers';

describe('Helper Functions', () => {
  describe('formatTimestamp', () => {
    it('should return ISO string for current date when no date provided', () => {
      const result = formatTimestamp();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should return ISO string for provided date', () => {
      const testDate = new Date('2024-01-01T12:00:00.000Z');
      const result = formatTimestamp(testDate);
      expect(result).toBe('2024-01-01T12:00:00.000Z');
    });
  });

  describe('isProduction', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should return true when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      expect(isProduction()).toBe(true);
    });

    it('should return false when NODE_ENV is not production', () => {
      process.env.NODE_ENV = 'development';
      expect(isProduction()).toBe(false);
    });
  });

  describe('isDevelopment', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should return true when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development';
      expect(isDevelopment()).toBe(true);
    });

    it('should return false when NODE_ENV is not development', () => {
      process.env.NODE_ENV = 'production';
      expect(isDevelopment()).toBe(false);
    });
  });

  describe('getEnvVar', () => {
    const originalValue = process.env.TEST_VAR;

    afterEach(() => {
      if (originalValue) {
        process.env.TEST_VAR = originalValue;
      } else {
        delete process.env.TEST_VAR;
      }
    });

    it('should return environment variable value when it exists', () => {
      process.env.TEST_VAR = 'test-value';
      expect(getEnvVar('TEST_VAR')).toBe('test-value');
    });

    it('should return fallback when environment variable does not exist', () => {
      delete process.env.TEST_VAR;
      expect(getEnvVar('TEST_VAR', 'fallback')).toBe('fallback');
    });

    it('should return empty string when no fallback provided and var does not exist', () => {
      delete process.env.TEST_VAR;
      expect(getEnvVar('TEST_VAR')).toBe('');
    });
  });

  describe('sanitizeErrorMessage', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should return generic message in production', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Detailed error message');
      expect(sanitizeErrorMessage(error)).toBe('Internal Server Error');
    });

    it('should return actual error message in development', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Detailed error message');
      expect(sanitizeErrorMessage(error)).toBe('Detailed error message');
    });
  });

  describe('delay', () => {
    it('should resolve after specified milliseconds', async () => {
      const start = Date.now();
      await delay(100);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(100);
    });
  });

  describe('generateRandomString', () => {
    it('should generate string of default length (10)', () => {
      const result = generateRandomString();
      expect(result).toHaveLength(10);
      expect(typeof result).toBe('string');
    });

    it('should generate string of specified length', () => {
      const result = generateRandomString(20);
      expect(result).toHaveLength(20);
    });

    it('should generate different strings on multiple calls', () => {
      const result1 = generateRandomString();
      const result2 = generateRandomString();
      expect(result1).not.toBe(result2);
    });

    it('should only contain alphanumeric characters', () => {
      const result = generateRandomString(100);
      expect(result).toMatch(/^[A-Za-z0-9]+$/);
    });
  });
});