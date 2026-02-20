"use server";

import { sendSupportEmail } from "@/lib/mailer";

export async function sendSupportEmailAction(formData: {
    name: string;
    email: string;
    subject: string;
    message: string;
}) {
    try {
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            return { success: false, message: "All fields are required" };
        }

        await sendSupportEmail(
            formData.email,
            formData.name,
            formData.subject,
            formData.message
        );

        return { success: true, message: "Your message has been sent successfully!" };
    } catch (error) {
        console.error("Support email error:", error);
        return { success: false, message: "Failed to send message. Please try again later." };
    }
}
