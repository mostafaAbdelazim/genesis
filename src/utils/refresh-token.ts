import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import ms from "ms";

function generateRefreshToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

async function saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const tokenHash = _hashRefreshToken(refreshToken);
    await prisma.refreshToken.create({
        data: {
            tokenHash,
            expiresAt: new Date(Date.now() + ms(env.refreshTokenExpiresIn as ms.StringValue)),
            userId
        }
    });
}

async function revokeRefreshToken(refreshToken: string): Promise<string> {
    const tokenHash = _hashRefreshToken(refreshToken);
    const refreshTokenRecord = await prisma.refreshToken.findUnique({
        where: {
            tokenHash
        }
    });
    if (!refreshTokenRecord || refreshTokenRecord.expiresAt.getTime() < Date.now() || refreshTokenRecord.revokedAt !== null) {
        throw new Error("Invalid refresh token");
    }

    await prisma.refreshToken.update({
        where: {
            tokenHash
        },
        data: {
            revokedAt: new Date(Date.now())
        }
    });
    return refreshTokenRecord.userId;
}

function _hashRefreshToken(refreshToken: string): string {
    return crypto.createHash("sha256").update(refreshToken).digest("hex");
}

export default {
    generateRefreshToken,
    saveRefreshToken,
    revokeRefreshToken
}