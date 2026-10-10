export function isValidEmail(email: string): boolean {
    // Email must be a valid email address and not contain spaces or special characters except for the @ symbol and the . symbol 
    // and the first character must be a letter and the last character must be a letter and the email must be less than 255 characters 
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) && email.length <= 255 && /^[a-zA-Z]/.test(email) && /[a-zA-Z]$/.test(email);
}

export function isValidPassword(password: string): boolean {
    // Password must contain at least one uppercase letter
    // and one lowercase letter
    // and one number
    // and one special character
    // and the password must be less than 100 characters
    // and the password must be at least 8 characters long 
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password) && password.length <= 100;
}

// string extension method 
export function isNullOrUndefinedOrEmpty(value: string | null | undefined): boolean {
    return value?.trim() === "" || value?.trim() === null || value?.trim() === undefined;
}

export function isNotEmptyOrNullOrUndefined(value: string | null | undefined): boolean {
    return value?.trim() !== "" && value?.trim() !== null && value?.trim() !== undefined;
}
