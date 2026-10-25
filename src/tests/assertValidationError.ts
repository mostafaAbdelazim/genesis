import assert from "node:assert/strict";

type ValidationResponse = {
  status: number;
  body: {
    error?: string;
    code?: string;
    statusCode?: number;
  };
};

export function assertValidationError(response: ValidationResponse, message: string) {
  assert.equal(response.status, 400);
  assert.equal(response.body.statusCode, 400);
  assert.equal(response.body.code, "VALIDATION_ERROR");
  assert.equal(response.body.error, message);
}
