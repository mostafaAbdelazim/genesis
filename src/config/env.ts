import { config } from "dotenv";
config();

const port = Number(process.env.PORT) || 3000;
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    throw new Error("DATABASE_URL is not set");
}

export const env = {
    port,
    nodeEnv: process.env.NODE_ENV ?? "development",
    dbUrl,
};