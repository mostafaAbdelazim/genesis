import { config } from "dotenv";
config();

const port = Number(process.env.PORT) || 3000;
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    throw new Error("DATABASE_URL is not set");
}

const jwtAccessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN||"15m";
const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
if (!jwtAccessSecret) {
    throw new Error("JWT_ACCESS_SECRET is not set");
}
export const env = {
    port,
    nodeEnv: process.env.NODE_ENV ?? "development",
    dbUrl,
    jwtAccessSecret,
    jwtAccessExpiresIn: jwtAccessExpiresIn
};