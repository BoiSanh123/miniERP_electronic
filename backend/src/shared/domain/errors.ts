export class DomainError extends Error {
  constructor(message: string, public readonly code: string = "DOMAIN_ERROR") {
    super(message);
  }
}
export class ValidationError extends DomainError {
  constructor(message: string, code = "VALIDATION_ERROR") {
    super(message, code);
  }
}
export class ConflictError extends DomainError {
  constructor(message: string, code = "CONFLICT") {
    super(message, code);
  }
}
export class NotFoundError extends DomainError {
  constructor(message: string, code = "NOT_FOUND") {
    super(message, code);
  }
}
export class ForbiddenError extends DomainError {
  constructor(message: string, code = "FORBIDDEN") {
    super(message, code);
  }
}
