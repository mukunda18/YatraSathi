export type ValidationResult = {
    success: boolean;
    errors?: Record<string, string>;
};

export const validateSignup = (data: Record<string, any>): ValidationResult => {
    const errors: Record<string, string> = {};

    if (!data.name || data.name.trim().length < 2) {
        errors.name = "Name must be at least 2 characters long";
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = "Invalid email address";
    }

    if (!data.password || data.password.length < 6) {
        errors.password = "Password must be at least 6 characters long";
    }

    if (!data.phone || !/^\+?[0-9]{10,15}$/.test(data.phone)) {
        errors.phone = "Invalid phone number (10-15 digits)";
    }

    return {
        success: Object.keys(errors).length === 0,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
    };
};

export const validateLogin = (data: Record<string, any>): ValidationResult => {
    const errors: Record<string, string> = {};

    if (!data.email || !data.email.trim()) {
        errors.email = "Email is required";
    }

    if (!data.password || !data.password.trim()) {
        errors.password = "Password is required";
    }

    return {
        success: Object.keys(errors).length === 0,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
    };
};
