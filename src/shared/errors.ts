export type AppError = {
	message: string;
	error?: unknown;
};

export type ValidationError = AppError & {
	input: any;
	expected: any;
};

export function createAppError(message: string, error?: unknown): AppError {
	return { message, error };
}

export function createValidationError(
	message: string,
	input: any,
	expected: any
): ValidationError {
	return { message, input, expected };
}
