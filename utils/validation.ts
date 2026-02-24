export type ValidationResult = {
    success: boolean;
    errors?: Record<string, string>;
};

const asString = (value: unknown): string => (typeof value === "string" ? value : "");
const asNumber = (value: unknown): number => (typeof value === "number" ? value : Number(value));

export const validateSignup = (data: unknown): ValidationResult => {
    const errors: Record<string, string> = {};
    const input = typeof data === "object" && data !== null ? data as Record<string, unknown> : {};
    const name = asString(input.name);
    const email = asString(input.email);
    const password = asString(input.password);
    const phone = asString(input.phone);

    if (!name || name.trim().length < 2) {
        errors.name = "Name must be at least 2 characters long";
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Invalid email address";
    }

    if (!password || password.length < 6) {
        errors.password = "Password must be at least 6 characters long";
    }

    if (!phone || !/^\+?[0-9]{10,15}$/.test(phone)) {
        errors.phone = "Invalid phone number (10-15 digits)";
    }

    return {
        success: Object.keys(errors).length === 0,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
    };
};

export const validateDriverRegistration = (data: unknown): ValidationResult => {
    const errors: Record<string, string> = {};
    const input = typeof data === "object" && data !== null ? data as Record<string, unknown> : {};
    const licenseNumber = asString(input.licenseNumber);
    const vehicleType = asString(input.vehicleType);
    const vehicleNumber = asString(input.vehicleNumber);

    if (!licenseNumber || licenseNumber.trim().length < 5) {
        errors.licenseNumber = "Invalid license number";
    }
    if (!vehicleType || vehicleType.trim().length < 2) {
        errors.vehicleType = "Vehicle type is required";
    }
    if (!vehicleNumber || vehicleNumber.trim().length < 4) {
        errors.vehicleNumber = "Invalid vehicle number";
    }

    return {
        success: Object.keys(errors).length === 0,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
    };
};

export const validateLogin = (data: unknown): ValidationResult => {
    const errors: Record<string, string> = {};
    const input = typeof data === "object" && data !== null ? data as Record<string, unknown> : {};
    const email = asString(input.email);
    const password = asString(input.password);

    if (!email || !email.trim()) {
        errors.email = "Email is required";
    }

    if (!password || !password.trim()) {
        errors.password = "Password is required";
    }

    return {
        success: Object.keys(errors).length === 0,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
    };
};

export const validateTrip = (data: unknown): ValidationResult => {
    const errors: Record<string, string> = {};
    const input = typeof data === "object" && data !== null ? data as Record<string, unknown> : {};
    const fromLocation = input.from_location;
    const fromAddress = asString(input.from_address);
    const toLocation = input.to_location;
    const toAddress = asString(input.to_address);
    const travelDateRaw = input.travel_date;
    const farePerSeat = asNumber(input.fare_per_seat);
    const totalSeats = asNumber(input.total_seats);
    const route = input.route;

    if (!fromLocation || !fromAddress) {
        errors.from = "Pickup location is required";
    }

    if (!toLocation || !toAddress) {
        errors.to = "Destination location is required";
    }

    if (!Array.isArray(route) || route.length < 2) {
        errors.route = "A valid route is required";
    }

    if (!travelDateRaw) {
        errors.date = "Travel date is required";
    } else {
        const travelDate = new Date(String(travelDateRaw));
        if (Number.isNaN(travelDate.getTime())) {
            errors.date = "Travel date is invalid";
        } else if (travelDate.getTime() < Date.now()) {
            errors.date = "Travel date and time must be in the future";
        }
    }

    if (!farePerSeat || farePerSeat < 0) {
        errors.fare = "Fare per seat must be a positive number";
    }

    if (!totalSeats || totalSeats < 1) {
        errors.seats = "There must be at least 1 seat available";
    }

    return {
        success: Object.keys(errors).length === 0,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
    };
};
