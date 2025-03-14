export class AppError extends Error {
	constructor(message: string, error?: unknown) {
		super(message, { cause: error });
		this.name = "AppError";
	}
}

export class ValidationError extends AppError {
	public expected: unknown;
	public input: unknown;

	constructor(message: string, input: unknown, expected: unknown) {
		super(message);
		this.input = input;
		this.expected = expected;
	}
}

export class DatabaseError extends AppError {
	constructor(message: string, error?: unknown) {
		super(message, { cause: error });
	}
}

export class DatabaseConstraintError extends DatabaseError {
	public constraint: string;

	constructor(message: string, constraint: string, error: unknown) {
		super(message, error);
		this.constraint = constraint;
	}
}

export class VKApiError extends AppError {
	constructor(message: string, error: unknown) {
		super(message, { cause: error });
	}
}
