import { hashPassword, verifyPassword } from "../utils/password.js";
import { generateAccessToken } from "../utils/tokens.js";
import refreshTokenUtils from "../utils/refresh-token.js";
import { prisma } from "../lib/prisma.js";
import {
  isValidEmail,
  isValidPassword,
  isNullOrUndefinedOrEmpty,
} from "../utils/input_validator.js";

export async function register(email: string, password: string, name: string) {
  _validateInput(email, password, name, true);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email already in use");
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      name: name,
    },
  });

  const refreshToken = refreshTokenUtils.generateRefreshToken();
  await refreshTokenUtils.saveRefreshToken(user.id, refreshToken);

  return {
    accessToken: generateAccessToken({ sub: user.id, email: user.email }),
    refreshToken: refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
}
export async function login(email: string, password: string) {
  _validateInput(email, password);

  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw new Error("Invalid credentials");
  }
  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const refreshToken = refreshTokenUtils.generateRefreshToken();
  await refreshTokenUtils.saveRefreshToken(user.id, refreshToken);

  return {
    accessToken: generateAccessToken({ sub: user.id, email: user.email }),
    refreshToken: refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}
export async function refresh(refreshToken: string) {
  const userId = await refreshTokenUtils.revokeRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new Error("User not found");
  }
  const newRefreshToken = refreshTokenUtils.generateRefreshToken();
  await refreshTokenUtils.saveRefreshToken(userId, newRefreshToken);

  return {
    accessToken: generateAccessToken({ sub: userId, email: user.email }),
    refreshToken: newRefreshToken,
  };
}

export async function logout(refreshToken: string) {
  try {
    await refreshTokenUtils.revokeRefreshToken(refreshToken);
  } catch (error) {
    console.error(error);
  }
}

function _validateInput(
  email: string,
  password: string,
  name?: string | null | undefined,
  isRegister: boolean = false,
) {
  if (isNullOrUndefinedOrEmpty(email)) {
    throw new Error("Email is required and cannot be empty");
  }
  if (isNullOrUndefinedOrEmpty(password)) {
    throw new Error("Password is required and cannot be empty");
  }
  if (isRegister && isNullOrUndefinedOrEmpty(name)) {
    throw new Error("Name is required and cannot be empty");
  }
  if (!isValidEmail(email)) {
    throw new Error("Invalid email");
  }
  if (isRegister && !isValidPassword(password)) {
    throw new Error(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    );
  }
}
