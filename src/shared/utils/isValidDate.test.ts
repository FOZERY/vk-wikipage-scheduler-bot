import assert from 'node:assert/strict';
import test from 'node:test';
import { isValidDate } from './isValidDate.js';

test('returns true for valid date', () => {
	const validDate = '01.01.2025';
	assert.strictEqual(isValidDate(validDate), true);
});

test('returns true for leap year', () => {
	const validDate = '29.02.2024';
	assert.strictEqual(isValidDate(validDate), true);
});

test('returns false for over leap year', () => {
	const validDate = '30.02.2024';
	assert.strictEqual(isValidDate(validDate), false);
});

test('returns false for invalid date #1', () => {
	const invalidDate = '01-01-2025';
	assert.strictEqual(isValidDate(invalidDate), false);
});

test('returns false for invalid date #2', () => {
	const invalidDate = '32.12.2025';
	assert.strictEqual(isValidDate(invalidDate), false);
});

test('returns true for last day of month', () => {
	const validDate = '31.01.2025';
	assert.strictEqual(isValidDate(validDate), true);
});

test('returns true for first day of month', () => {
	const validDate = '01.01.2025';
	assert.strictEqual(isValidDate(validDate), true);
});

test('returns false for over leap year', () => {
	const invalidDate = '30.02.2024';
	assert.strictEqual(isValidDate(invalidDate), false);
});

test('returns false for invalid date format #1', () => {
	const invalidDate = '01-01-2025';
	assert.strictEqual(isValidDate(invalidDate), false);
});

test('returns false for invalid date format #2', () => {
	const invalidDate = '2025.01.01';
	assert.strictEqual(isValidDate(invalidDate), false);
});

test('returns false for invalid day', () => {
	const invalidDate = '32.12.2025';
	assert.strictEqual(isValidDate(invalidDate), false);
});

test('returns false for invalid month', () => {
	const invalidDate = '01.13.2025';
	assert.strictEqual(isValidDate(invalidDate), false);
});

test('returns false for invalid year (before 1900)', () => {
	const invalidDate = '01.01.1899';
	assert.strictEqual(isValidDate(invalidDate), false);
});

test('returns false for invalid year (after 2099)', () => {
	const invalidDate = '01.01.2100';
	assert.strictEqual(isValidDate(invalidDate), false);
});

test('returns false for empty string', () => {
	const invalidDate = '';
	assert.strictEqual(isValidDate(invalidDate), false);
});

test('returns false for invalid characters', () => {
	const invalidDate = 'ab.cd.efgh';
	assert.strictEqual(isValidDate(invalidDate), false);
});

// Пограничные случаи
test('returns true for minimum valid year (1900)', () => {
	const validDate = '01.01.1900';
	assert.strictEqual(isValidDate(validDate), true);
});

test('returns true for maximum valid year (2099)', () => {
	const validDate = '31.12.2099';
	assert.strictEqual(isValidDate(validDate), true);
});

test('returns false for non-existent date (31.04.2025)', () => {
	const invalidDate = '31.04.2025';
	assert.strictEqual(isValidDate(invalidDate), false);
});

test('returns false for non-existent date (30.02.2025)', () => {
	const invalidDate = '30.02.2025';
	assert.strictEqual(isValidDate(invalidDate), false);
});

test('returns false for non-existent date (29.02.2023)', () => {
	const invalidDate = '29.02.2023';
	assert.strictEqual(isValidDate(invalidDate), false);
});
