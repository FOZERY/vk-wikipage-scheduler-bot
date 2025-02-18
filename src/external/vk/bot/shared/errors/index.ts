export const invalidFormatErr = (input: string, expected: string) => ({
	message: `Invalid format of input date`,
	input: input,
	expected: expected,
});
