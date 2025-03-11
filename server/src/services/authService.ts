import { ModelStatic, ValidationError, ValidationErrorItem } from "sequelize";
import jwt from "jsonwebtoken";
import User from "../models/user";
import HttpError from "../utils/error/httpError";
import bcrypt from 'bcrypt';
import { auth } from "../config/firebase";

class AuthService {
    private userModel: ModelStatic<User>;
    private secretKey: string;

    constructor(userModel: ModelStatic<User>, secretKey: string) {
        this.userModel = userModel;
        this.secretKey = secretKey;
    }

    async createUser(userDTO: { name: string, email: string, password: string, image: string }) {
        const { name, email, password, image } = userDTO;
    
        if (!email || !name || !password || !image) {
            throw new HttpError("Todos os campos são obrigatórios.", 400);
        }

        try {
            const usuarioExiste = await auth.getUserByEmail(email);

            if (usuarioExiste) {
                throw new HttpError("E-mail já cadastrado.", 400);
            }
        } catch (error: unknown) {
            if ((error as any).code !== 'auth/user-not-found') {
                throw new HttpError("Erro ao verificar usuário existente.", 500, error instanceof Error ? error : new Error('Erro desconhecido'));
            }
        }
    
        try {
            const novoUsuario = await auth.createUser({
                email,
                password,
                displayName: name,
            });

            await auth.setCustomUserClaims(novoUsuario.uid, { localImageUrl: image });
    
            return { status: 201, message: "Usuário criado com sucesso!", data: novoUsuario };
        } catch (error) {    
            if (error instanceof Error) {
                throw new HttpError("Erro interno ao criar usuário.", 500, error);
            }
    
            throw new HttpError("Erro interno ao criar usuário.", 500);
        }    
    }
}


export default AuthService;