import { hashPassword, verifyPassword } from "../utils/password.js";
import { generateAccessToken } from "../utils/tokens.js";
import { prisma } from "../lib/prisma.js";
import { isValidEmail, isValidPassword, isNullOrUndefinedOrEmpty } from "../utils/input_validator.js";

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

function _validateInput(email: string, password: string, name?: string | null | undefined, isRegister: boolean = false) {
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
        throw new Error("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
    }
}
