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

export const validateDriverRegistration = (data: Record<string, any>): ValidationResult => {
    const errors: Record<string, string> = {};

    if (!data.licenseNumber || data.licenseNumber.trim().length < 5) {
        errors.licenseNumber = "Invalid license number";
    }
    if (!data.vehicleType || data.vehicleType.trim().length < 2) {
        errors.vehicleType = "Vehicle type is required";
    }
    if (!data.vehicleNumber || data.vehicleNumber.trim().length < 4) {
        errors.vehicleNumber = "Invalid vehicle number";
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

export const validateTrip = (data: Record<string, any>): ValidationResult => {
    const errors: Record<string, string> = {};

    if (!data.from_location || !data.from_address) {
        errors.from = "Pickup location is required";
    }

    if (!data.to_location || !data.to_address) {
        errors.to = "Destination location is required";
    }

    if (!data.travel_date || new Date(data.travel_date) <= new Date()) {
        errors.date = "Travel date must be in the future";
    }

    if (!data.fare_per_seat || Number(data.fare_per_seat) < 0) {
        errors.fare = "Fare per seat must be a positive number";
    }

    if (!data.total_seats || Number(data.total_seats) < 1) {
        errors.seats = "There must be at least 1 seat available";
    }

    return {
        success: Object.keys(errors).length === 0,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
    };
};
