import assert from "node:assert/strict";

type ValidationResponse = {
  status: number;
  body: {
    error?: string;
    code?: string;
    details?: { message: string }[];
  };
};

export function assertValidationError(response: ValidationResponse, message: string) {
  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Validation failed");
  assert.equal(response.body.code, "VALIDATION_ERROR");
  const messages = response.body.details?.map((issue) => issue.message) ?? [];
  assert.ok(messages.includes(message), messages.join(" | "));
}
