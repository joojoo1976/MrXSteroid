/**
 * Sample Unit Tests for Mr. X Steroid Application
 * Demonstrates the testing framework capabilities
 */

import { 
    testRunner, 
    describe, 
    it, 
    expect, 
    unitTest, 
    perfTest, 
    integrationTest,
    Assert,
    Mock
} from './testing-framework';

// Example functions to test
export function add(a: number, b: number): number {
    return a + b;
}

export function multiply(a: number, b: number): number {
    return a * b;
}

export function isEven(num: number): boolean {
    return num % 2 === 0;
}

export function calculateBMI(weight: number, height: number): number {
    if (height <= 0) throw new Error('Height must be greater than 0');
    return weight / (height / 100) ** 2;
}

export class Calculator {
    add(a: number, b: number): number {
        return a + b;
    }

    subtract(a: number, b: number): number {
        return a - b;
    }

    multiply(a: number, b: number): number {
        return a * b;
    }

    divide(a: number, b: number): number {
        if (b === 0) throw new Error('Division by zero');
        return a / b;
    }
}

// Unit tests
describe('Basic Math Functions', () => {
    unitTest('should add two numbers correctly', () => {
        const result = add(2, 3);
        expect(result).toBe(5);
    });

    unitTest('should multiply two numbers correctly', () => {
        const result = multiply(4, 5);
        expect(result).toBe(20);
    });

    unitTest('should determine if a number is even', () => {
        expect(isEven(4)).toBeTruthy();
        expect(isEven(5)).toBeFalsy();
    });

    unitTest('should throw error for invalid BMI calculation', () => {
        expect(() => calculateBMI(70, 0)).toThrow(Error);
    });

    unitTest('should calculate BMI correctly', () => {
        const bmi = calculateBMI(70, 175); // 70kg, 175cm
        expect(bmi).toBeCloseTo(22.86, 2); // Rounded to 2 decimal places
    });
});

describe('Calculator Class', () => {
    let calc: Calculator;

    it('should initialize calculator', () => {
        calc = new Calculator();
        expect(calc).toBeDefined();
    });

    unitTest('should add numbers', () => {
        const result = calc.add(5, 3);
        expect(result).toBe(8);
    });

    unitTest('should subtract numbers', () => {
        const result = calc.subtract(10, 4);
        expect(result).toBe(6);
    });

    unitTest('should multiply numbers', () => {
        const result = calc.multiply(3, 7);
        expect(result).toBe(21);
    });

    unitTest('should divide numbers', () => {
        const result = calc.divide(15, 3);
        expect(result).toBe(5);
    });

    unitTest('should throw error when dividing by zero', () => {
        expect(() => calc.divide(10, 0)).toThrow(Error);
    });
});

// Performance tests
describe('Performance Tests', () => {
    perfTest('add function should execute in under 1ms', () => {
        add(100, 200);
    }, 1);

    perfTest('multiply function should execute in under 1ms', () => {
        multiply(100, 200);
    }, 1);

    perfTest('large calculation should execute in under 10ms', () => {
        // Simulate a more intensive calculation
        let result = 0;
        for (let i = 0; i < 1000; i++) {
            result += multiply(add(i, i + 1), 2);
        }
        return result;
    }, 10);
});

// Mock tests
describe('Mock Tests', () => {
    it('should mock a function correctly', () => {
        const mockObj = {
            getData: (): string => 'real data'
        };

        const spy = Mock.spyOn(mockObj, 'getData');
        const result = mockObj.getData();

        expect(spy.calls.length).toBe(1);
        expect(result).toBeDefined();
        
        spy.reset(); // Restore original function
    });
});

// Integration tests
describe('Integration Tests', () => {
    integrationTest('should chain calculator operations', () => {
        const calc = new Calculator();
        const result = calc.multiply(calc.add(5, 3), 2); // (5 + 3) * 2 = 16
        expect(result).toBe(16);
    });

    integrationTest('should calculate complex formula', () => {
        const weight = 70; // kg
        const height = 175; // cm
        
        const bmi = calculateBMI(weight, height);
        const isHealthy = bmi >= 18.5 && bmi <= 24.9;
        
        expect(bmi).toBeGreaterThan(0);
        expect(isHealthy).toBeTruthy();
    });
});

// Async tests
describe('Async Tests', () => {
    async function asyncAdd(a: number, b: number): Promise<number> {
        return new Promise(resolve => {
            setTimeout(() => resolve(a + b), 10);
        });
    }

    it('should handle async operations', async () => {
        const result = await asyncAdd(5, 7);
        expect(result).toBe(12);
    });

    it('should handle promise rejections', async () => {
        const failingPromise = Promise.reject(new Error('Test error'));
        
        try {
            await failingPromise;
            expect(false).toBeTruthy(); // Should not reach here
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
});

// Run all tests
export async function runSampleTests() {
    console.log('Running sample tests...\n');
    const results = await testRunner.run();
    const summary = testRunner.getSummary();
    
    console.log(`\nFinal Summary: ${summary.passed}/${summary.total} tests passed`);
    
    return results;
}

// If this file is run directly, execute the tests
if (typeof window !== 'undefined' || require.main === module) {
    runSampleTests();
}