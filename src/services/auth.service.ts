import { hashPassword, verifyPassword } from "../utils/password.js";
import { generateAccessToken } from "../utils/tokens.js";
import refreshTokenUtils from "../utils/refresh-token.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";

export async function register(email: string, password: string, name: string) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError("Email already in use", 400);
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
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }
  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
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
    throw new AppError("User not found", 404);
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
