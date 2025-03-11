import 'dotenv/config';
import { Router, Request, Response, NextFunction } from "express";
import AuthService from '../services/authService';
import User from '../models/user';
import FileService from '../services/fileService';
import authenticateToken from '../utils/middlewares/authenticateToken';
import HttpError from '../utils/error/httpError';


const SECRET_KEY: string = process.env.SECRET_KEY || 'default_secret_key';
const router = Router();
const authService = new AuthService(User, SECRET_KEY)
const uploadService = new FileService();
const fileService = new FileService();

router.post("/register", uploadService.singleUpload, async (request: Request, response: Response, next: NextFunction) => {
    try {
        const userDTO = request.body;

        let imageUrl: string | undefined;

        if (request.file) {
            imageUrl = fileService.generateImageUrl(request.file, request);
        }

        const newUser = await authService.createUser({ ...userDTO, image:imageUrl });

        response.status(201).json({
            message: "Usuário criado com sucesso.",
            data: newUser,
        });
    } catch (error) {
        next(error)
    };
});

router.post("/login", authenticateToken, async (request: Request, response: Response, next: NextFunction) => {
    try {
        const user = request.user;

        const authHeader = request.headers.authorization;
        if (!authHeader) {
            throw new HttpError("Token de autorização não fornecido.", 401);
        }

        const token = authHeader.split(" ")[1];
        
        response.status(200).json({
            message: "Usuário logado com sucesso.",
            token: token,
            user: user
        });
    } catch (error) {
        next(error);
    };
});



export default router;