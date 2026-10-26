import { expect } from "expect";

type ValidationResponse = {
  status: number;
  body: {
    error?: string;
    code?: string;
    statusCode?: number;
  };
};

export function assertValidationError(response: ValidationResponse, message: string) {
  expect(response.status).toBe(400);
  expect(response.body.statusCode).toBe(400);
  expect(response.body.code).toBe("VALIDATION_ERROR");
  expect(response.body.error).toBe(message);
}
