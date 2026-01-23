import { useAuthStore } from "@/store/authStore";
import * as authService from "@/service/authService";
import { onLogout } from "@/app/actions/authActions";

export async function handleSignup(name: string, email: string, password: string, phone: string) {
    try {
        useAuthStore.setState({ connecting: true });
        const response = await authService.signup(name, email, password, phone);
        if (response.success) {
            useAuthStore.setState(response.user);
        }
    } catch (error) {
        console.log(error);
    }
    finally {
        useAuthStore.setState({ connecting: false });
    }
}

export async function handleLogin(email: string, password: string) {
    try {
        useAuthStore.setState({ connecting: true });
        const response = await authService.login(email, password);
        if (response.success) {
            useAuthStore.setState(response.user);
        }
    } catch (error) {

    }
    finally {
        useAuthStore.setState({ connecting: false });
    }
}

export async function handleLogout() {
    await onLogout();
    useAuthStore.setState({ name: "", email: "" });
}
