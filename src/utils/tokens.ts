import { env } from "../config/env.js";
import jwt from "jsonwebtoken";
import { SignOptions } from "jsonwebtoken";

export type AccessTokenPayload = {
    sub: string;
    email: string;
    iat?: number;
    exp?: number;
}

export function generateAccessToken(payload: AccessTokenPayload): string {
    let token = jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.jwtAccessExpiresIn } as SignOptions);
    return token;
}

export function verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
}
