import { getDriverByUserId, Driver } from "@/db/db";
import { getUserId } from "./authActions";

export const getAuthenticatedUserId = async (): Promise<{ userId: string | null; error: { success: false; message: string } | null }> => {
    const userId = await getUserId();
    if (!userId) {
        return { userId: null, error: { success: false, message: "Unauthorized" } };
    }
    return { userId, error: null };
};

export const getAuthenticatedDriver = async (): Promise<{ driver: Driver | null; error: { success: false; message: string } | null }> => {
    const { userId, error } = await getAuthenticatedUserId();
    if (error) {
        return { driver: null, error };
    }

    const driver = await getDriverByUserId(userId!);
    if (!driver) {
        return { driver: null, error: { success: false, message: "Driver profile not found" } };
    }

    return { driver, error: null };
};
