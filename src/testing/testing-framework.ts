/**
 * Comprehensive Testing Framework for Mr. X Steroid Application
 * Implements unit, integration, and performance tests
 */

// Test interfaces
export interface TestResult {
    testName: string;
    status: 'pass' | 'fail' | 'skip';
    duration: number;
    error?: Error;
    timestamp: Date;
}

export interface TestSuite {
    name: string;
    tests: TestCase[];
    beforeAll?: () => Promise<void> | void;
    afterAll?: () => Promise<void> | void;
    beforeEach?: () => Promise<void> | void;
    afterEach?: () => Promise<void> | void;
}

export interface TestCase {
    name: string;
    testFn: () => Promise<void> | void;
    skip?: boolean;
    timeout?: number;
}

export interface TestReporter {
    report(results: TestResult[]): void;
}

// Assertion utilities
export class AssertionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AssertionError';
    }
}

export class Assert {
    static equal(actual: any, expected: any, message?: string): void {
        if (actual != expected) {
            throw new AssertionError(message || `Expected ${expected}, but got ${actual}`);
        }
    }

    static deepEqual(actual: any, expected: any, message?: string): void {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new AssertionError(message || `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
        }
    }

    static throws(fn: () => any, expectedError?: any, message?: string): void {
        try {
            fn();
            throw new AssertionError(message || 'Expected function to throw an error');
        } catch (error) {
            if (expectedError && !(error instanceof expectedError)) {
                throw new AssertionError(message || `Expected error of type ${expectedError.name}, but got ${error.constructor.name}`);
            }
        }
    }

    static isTrue(value: boolean, message?: string): void {
        if (!value) {
            throw new AssertionError(message || `Expected true, but got ${value}`);
        }
    }

    static isFalse(value: boolean, message?: string): void {
        if (value) {
            throw new AssertionError(message || `Expected false, but got ${value}`);
        }
    }

    static isDefined(value: any, message?: string): void {
        if (value === undefined) {
            throw new AssertionError(message || `Expected value to be defined, but got undefined`);
        }
    }

    static isUndefined(value: any, message?: string): void {
        if (value !== undefined) {
            throw new AssertionError(message || `Expected value to be undefined, but got ${value}`);
        }
    }

    static isNull(value: any, message?: string): void {
        if (value !== null) {
            throw new AssertionError(message || `Expected null, but got ${value}`);
        }
    }

    static isNotNull(value: any, message?: string): void {
        if (value === null) {
            throw new AssertionError(message || `Expected not null, but got null`);
        }
    }
}

// Mock utilities for testing
export class Mock {
    static create<T>(implementation?: Partial<T>): T {
        return implementation as T;
    }

    static spyOn<T extends Record<string, any>, K extends keyof T>(
        obj: T,
        methodName: K
    ): { calls: any[][]; results: any[]; reset: () => void } {
        const originalMethod = obj[methodName];
        const calls: any[][] = [];
        const results: any[] = [];

        obj[methodName] = function (...args: any[]) {
            calls.push(args);
            const result = originalMethod.apply(this, args);
            results.push(result);
            return result;
        } as T[K];

        return {
            calls,
            results,
            reset: () => {
                obj[methodName] = originalMethod;
            }
        };
    }
}

// Test runner
export class TestRunner {
    private suites: TestSuite[] = [];
    private results: TestResult[] = [];
    private reporters: TestReporter[] = [];
    private timeout: number = 5000; // 5 seconds default timeout

    addSuite(suite: TestSuite): void {
        this.suites.push(suite);
    }

    addReporter(reporter: TestReporter): void {
        this.reporters.push(reporter);
    }

    async run(): Promise<TestResult[]> {
        this.results = [];

        for (const suite of this.suites) {
            await this.runSuite(suite);
        }

        this.reporters.forEach(reporter => reporter.report(this.results));
        return this.results;
    }

    private async runSuite(suite: TestSuite): Promise<void> {
        console.log(`\n🧪 Running test suite: ${suite.name}`);

        // Run beforeAll hook
        if (suite.beforeAll) {
            try {
                await suite.beforeAll();
            } catch (error) {
                console.error(`beforeAll hook failed:`, error);
            }
        }

        for (const testCase of suite.tests) {
            if (testCase.skip) {
                this.results.push({
                    testName: `${suite.name} - ${testCase.name}`,
                    status: 'skip',
                    duration: 0,
                    timestamp: new Date()
                });
                continue;
            }

            // Run beforeEach hook
            if (suite.beforeEach) {
                try {
                    await suite.beforeEach();
                } catch (error) {
                    console.error(`beforeEach hook failed:`, error);
                }
            }

            const startTime = performance.now();
            let status: 'pass' | 'fail' = 'pass';
            let error: Error | undefined;

            try {
                // Run test with timeout
                const timeoutPromise = new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error('Test timeout')), testCase.timeout || this.timeout);
                });

                const testPromise = Promise.resolve(testCase.testFn());
                await Promise.race([testPromise, timeoutPromise]);
            } catch (err) {
                status = 'fail';
                error = err instanceof Error ? err : new Error(String(err));
            }

            const duration = performance.now() - startTime;

            this.results.push({
                testName: `${suite.name} - ${testCase.name}`,
                status,
                duration,
                error,
                timestamp: new Date()
            });

            if (status === 'pass') {
                console.log(`  ✓ ${testCase.name} (${Math.round(duration)}ms)`);
            } else {
                console.log(`  ✗ ${testCase.name} - ${error?.message}`);
            }

            // Run afterEach hook
            if (suite.afterEach) {
                try {
                    await suite.afterEach();
                } catch (error) {
                    console.error(`afterEach hook failed:`, error);
                }
            }
        }

        // Run afterAll hook
        if (suite.afterAll) {
            try {
                await suite.afterAll();
            } catch (error) {
                console.error(`afterAll hook failed:`, error);
            }
        }
    }

    getResults(): TestResult[] {
        return [...this.results];
    }

    getSummary(): { total: number; passed: number; failed: number; skipped: number } {
        const total = this.results.length;
        const passed = this.results.filter(r => r.status === 'pass').length;
        const failed = this.results.filter(r => r.status === 'fail').length;
        const skipped = this.results.filter(r => r.status === 'skip').length;

        return { total, passed, failed, skipped };
    }
}

// Console reporter
export class ConsoleReporter implements TestReporter {
    report(results: TestResult[]): void {
        const summary = this.getSummary(results);
        
        console.log('\n📊 Test Results Summary:');
        console.log(`Total: ${summary.total}, Passed: ${summary.passed}, Failed: ${summary.failed}, Skipped: ${summary.skipped}`);
        
        if (summary.failed > 0) {
            console.log('\n❌ Failed Tests:');
            results
                .filter(r => r.status === 'fail')
                .forEach(r => {
                    console.log(`  ${r.testName}: ${r.error?.message}`);
                });
        }
    }

    private getSummary(results: TestResult[]) {
        return {
            total: results.length,
            passed: results.filter(r => r.status === 'pass').length,
            failed: results.filter(r => r.status === 'fail').length,
            skipped: results.filter(r => r.status === 'skip').length
        };
    }
}

// JSON reporter
export class JSONReporter implements TestReporter {
    report(results: TestResult[]): void {
        const output = {
            timestamp: new Date().toISOString(),
            results: results.map(r => ({
                ...r,
                timestamp: r.timestamp.toISOString(),
                error: r.error ? r.error.toString() : undefined
            })),
            summary: this.getSummary(results)
        };

        console.log(JSON.stringify(output, null, 2));
    }

    private getSummary(results: TestResult[]) {
        return {
            total: results.length,
            passed: results.filter(r => r.status === 'pass').length,
            failed: results.filter(r => r.status === 'fail').length,
            skipped: results.filter(r => r.status === 'skip').length
        };
    }
}

// Performance test utilities
export class PerformanceTester {
    static async measureFunction<T>(
        fn: () => T | Promise<T>,
        iterations: number = 100
    ): Promise<{ avg: number; min: number; max: number; median: number }> {
        const times: number[] = [];

        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            const result = await Promise.resolve(fn());
            const end = performance.now();
            times.push(end - start);
        }

        times.sort((a, b) => a - b);

        const sum = times.reduce((acc, val) => acc + val, 0);
        const avg = sum / times.length;
        const min = times[0];
        const max = times[times.length - 1];
        const median = times[Math.floor(times.length / 2)];

        return { avg, min, max, median };
    }

    static async assertMaxExecutionTime(
        fn: () => any,
        maxTimeMs: number,
        iterations: number = 10
    ): Promise<void> {
        const stats = await this.measureFunction(fn, iterations);
        
        if (stats.avg > maxTimeMs) {
            throw new AssertionError(
                `Function took too long to execute. Avg: ${stats.avg}ms, Max allowed: ${maxTimeMs}ms`
            );
        }
    }
}

// Create a global test runner instance
export const testRunner = new TestRunner();
testRunner.addReporter(new ConsoleReporter());

// Test decorators and functions
export function describe(
    name: string,
    definition: () => void,
    options: { beforeAll?: () => void; afterAll?: () => void; beforeEach?: () => void; afterEach?: () => void } = {}
): TestSuite {
    const suite: TestSuite = {
        name,
        tests: [],
        beforeAll: options.beforeAll,
        afterAll: options.afterAll,
        beforeEach: options.beforeEach,
        afterEach: options.afterEach
    };

    // Temporarily store the suite to collect tests
    const originalTests = [...testRunner['suites'].flatMap(s => s.tests)];
    definition();
    
    // Get newly added tests and assign them to this suite
    const currentTests = testRunner['suites'].flatMap(s => s.tests);
    const newTests = currentTests.filter(test => !originalTests.includes(test));
    
    suite.tests = newTests;
    testRunner['suites'] = testRunner['suites'].filter(s => s !== suite);
    testRunner.addSuite(suite);

    return suite;
}

export function it(name: string, testFn: () => void, options: { skip?: boolean; timeout?: number } = {}): void {
    const testCase: TestCase = {
        name,
        testFn,
        skip: options.skip,
        timeout: options.timeout
    };

    // Add to the last suite
    if (testRunner['suites'].length > 0) {
        testRunner['suites'][testRunner['suites'].length - 1].tests.push(testCase);
    } else {
        // If no suite exists, create a default one
        testRunner.addSuite({
            name: 'Default Suite',
            tests: [testCase]
        });
    }
}

export function test(name: string, testFn: () => void, options: { skip?: boolean; timeout?: number } = {}): void {
    it(name, testFn, options);
}

export function skip(name: string, testFn: () => void, timeout?: number): void {
    it(name, testFn, { skip: true, timeout });
}

// Export the assertion library
export const expect = (actual: any) => ({
    toBe: (expected: any) => Assert.equal(actual, expected),
    toEqual: (expected: any) => Assert.deepEqual(actual, expected),
    toBeTruthy: () => Assert.isTrue(Boolean(actual)),
    toBeFalsy: () => Assert.isFalse(Boolean(actual)),
    toBeNull: () => Assert.isNull(actual),
    toBeUndefined: () => Assert.isUndefined(actual),
    toBeDefined: () => Assert.isDefined(actual),
    toThrow: (expectedError?: any) => Assert.throws(() => actual, expectedError)
});

// Performance test function
export function perfTest(
    name: string,
    testFn: () => void,
    maxAvgTimeMs: number,
    iterations: number = 10
): void {
    it(name, async () => {
        await PerformanceTester.assertMaxExecutionTime(testFn, maxAvgTimeMs, iterations);
    });
}

// Integration test function
export function integrationTest(name: string, testFn: () => void): void {
    it(name, testFn);
}

// Unit test function
export function unitTest(name: string, testFn: () => void): void {
    it(name, testFn);
}