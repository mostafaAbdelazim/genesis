import { hashPassword, verifyPassword } from "../utils/password.js";
import { generateAccessToken } from "../utils/tokens.js";
import { prisma } from "../lib/prisma.js";
import { isValidEmail, isValidPassword, isNullOrUndefinedOrEmpty } from "../utils/input_validator.js";

export async function register(email: string, password: string, name: string) {
    const error = _validateInput(email, password, name, true);
    if (error) {
        throw new Error(error);
    }

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

    return {
        accessToken: generateAccessToken({ sub: user.id, email: user.email }),
        user: {
            id: user.id,
            email: user.email,
            name: user.name
        }
    };
}
export async function login(email: string, password: string) {
    const error = _validateInput(email, password);
    if (error) {
        throw new Error(error);
    }

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
    return {
        accessToken: generateAccessToken({ sub: user.id, email: user.email }),
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }
    };
}

function _validateInput(email: string, password: string, name?: string | null | undefined, isRegister: boolean = false): string | null {
    if (isNullOrUndefinedOrEmpty(email)) {
        return "Email is required and cannot be empty";
    }
    if (isNullOrUndefinedOrEmpty(password)) {
        return "Password is required and cannot be empty";
    }
    if (isRegister && isNullOrUndefinedOrEmpty(name)) {
        return "Name is required and cannot be empty";
    }
    if (!isValidEmail(email)) {
        return "Invalid email";
    }
    if (isRegister && !isValidPassword(password)) {
        return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
    }
    return null;
}
