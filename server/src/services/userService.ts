import admin from "firebase-admin";
import User from "../models/user";
import HttpError from "../utils/error/httpError";
import { auth } from "../config/firebase";
import { UserResponse } from "../@types/user";


class UserService {
    formatUser(userRecord: admin.auth.UserRecord): UserResponse {
        const createdAt = new Date(userRecord.metadata.creationTime).toISOString();
        const updatedAt = new Date(userRecord.metadata.lastSignInTime || userRecord.metadata.creationTime).toISOString();
    
        return {
            id: userRecord.uid,
            name: userRecord.displayName || '',
            email: userRecord.email || '',
            image: userRecord.customClaims?.localImageUrl || '',
            password: '',
            createdAt: createdAt,
            updatedAt: updatedAt,
        };
    }

    async getAllUsers() {
        try {
            const listUsersResult = await auth.listUsers();
            return listUsersResult.users.map(this.formatUser);
        } catch (error) {
            if (error instanceof Error) {
                throw new HttpError("Não foi possível buscar usuários", 500, error);
            }

            throw new HttpError("Erro interno ao tentar buscar usuários.", 500);
        }
    }

    async getUserById(userId: string) {
        try {
            const userRecord = await auth.getUser(userId);
            if (!userRecord) {
                throw new HttpError("Usuário não encontrado.", 404);
            }
            return this.formatUser(userRecord);
        } catch (error) {
            if (error instanceof HttpError) {
                throw new HttpError(error.message, error.statusCode);
            }

            throw new HttpError("Erro interno ao buscar usuário.", 500);
        }
    }

    async getUserByEmail(userEmail: string) {
        try {
            const userRecord = await auth.getUserByEmail(userEmail);
            if (!userRecord) {
                throw new HttpError("Usuário não encontrado.", 404);
            }
            return this.formatUser(userRecord);
        } catch (error) {
            if (error instanceof HttpError) {
                throw new HttpError(error.message, error.statusCode);
            }

            throw new HttpError("Erro interno ao buscar usuário.", 500);
        }
    }

    async deleteUser(email: string) {
        try {
            const userRecord = await this.getUserByEmail(email);
            if (!userRecord) {
                throw new HttpError("Usuário não encontrado.", 404);
            }

            await auth.deleteUser(userRecord.id);
        } catch (error) {
            if (error instanceof Error) {
                throw new HttpError("Erro ao deletar usuário.", 500, new Error(error.message));
            }

            throw new HttpError("Erro ao deletar usuário.", 500);
        }
    }

}


export default UserService;