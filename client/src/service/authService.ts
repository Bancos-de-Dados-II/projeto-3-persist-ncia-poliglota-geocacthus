import { signInWithEmailAndPassword } from "firebase/auth";
import { apiConfig } from "../config/api";
import { IUser } from "./userService";
import { auth } from "../config/firebase";


interface LoginData {
    email: string;
    password: string;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
    image: File | null;
}

interface LoginResponse {
    message: string;
    token: string;
    user: IUser
}

const login = async (formData: LoginData): Promise<LoginResponse> => {
    const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
    const idToken = await userCredential.user.getIdToken();
    console.log(idToken);

    const response = await fetch(`${apiConfig.baseUrl}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify(formData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Authentication failed");
    }

    const data = await response.json();
    return data;
};

const register = async (formData: FormData) => {
    console.log(formData);
    const response = await fetch(`${apiConfig.baseUrl}/auth/register`, {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
    }

    const data = await response.json();
    return data;
};


export { login, register };
export type { LoginData, LoginResponse, RegisterData };