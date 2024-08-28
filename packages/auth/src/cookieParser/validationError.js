class ValidationError extends Error {
  constructor(message, parseErrors) {
    super(message);
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
    this.name = 'ValidationError';
    this.parseErrors = parseErrors;
  }
}

export default ValidationError;
