import { AuthError, signInWithEmailAndPassword } from "firebase/auth";
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
    try {
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
            throw new Error(errorData.message || "Falha na autenticação");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if ((error as AuthError).code) {
            switch ((error as AuthError).code) {
                case "auth/invalid-credential":
                    throw new Error("Email ou senha incorretos.");
                case "auth/user-not-found":
                    throw new Error("Usuário não encontrado. Verifique o email digitado.");
                case "auth/wrong-password":
                    throw new Error("Senha incorreta.");
                case "auth/user-disabled":
                    throw new Error("Esta conta foi desativada. Entre em contato com o suporte.");
                case "auth/too-many-requests":
                    throw new Error("Muitas tentativas de login. Tente novamente mais tarde.");
                default:
                    throw new Error("Ocorreu um erro inesperado ao fazer login.");
            }
        }

        throw error;
    }
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