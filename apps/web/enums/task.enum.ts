export enum TaskStatus {
  NEW = "new",
  DOING = "doing",
  PENDING_VERIFICATION = "pending_verification",
  VERIFICATION_FAILED = "verification_failed",
  VERIFIED = "verified",
  CLOSED = "closed",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}
