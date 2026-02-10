// Custom error classes

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class AuthError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, "AUTH_ERROR", 401);
    this.name = "AuthError";
  }
}

export class PlanLimitError extends AppError {
  constructor(message: string = "Plan limit exceeded") {
    super(message, "PLAN_LIMIT_ERROR", 403);
    this.name = "PlanLimitError";
  }
}

export class AIError extends AppError {
  constructor(message: string = "AI processing failed") {
    super(message, "AI_ERROR", 500);
    this.name = "AIError";
  }
}

export class UploadError extends AppError {
  constructor(message: string = "File upload failed") {
    super(message, "UPLOAD_ERROR", 400);
    this.name = "UploadError";
  }
}
