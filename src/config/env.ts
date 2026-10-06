import { config } from "dotenv";
config();

const port = Number(process.env.PORT) || 3000;

export const env = {
    port,
    nodeEnv: process.env.NODE_ENV ?? "development",
};