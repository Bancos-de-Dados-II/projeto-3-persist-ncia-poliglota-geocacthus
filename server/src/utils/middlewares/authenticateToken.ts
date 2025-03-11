import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from "express";
import HttpError from "../error/httpError";
import User from "../../models/user";
import { auth } from "../../config/firebase";


dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';


const authenticateToken = async(request: Request, response: Response, next: NextFunction) => {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
        throw next(new HttpError("Token não fornecido.", 401));
    }

    const idToken = authHeader.split(" ")[1];

    console.log(idToken);

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        console.log(decodedToken);

        if (decodedToken && decodedToken.email) {
            request.user = {
                id: decodedToken.uid,
                name: decodedToken.name || "",
                email: decodedToken.email,
                password: "",
            };
        } else {
            throw new HttpError("Token inválido ou com informações faltando.", 403);
        }
        
        next();
    } catch (error) {
        return next(new HttpError("Token inválido ou expirado.", 403));
    }
};

export default authenticateToken;