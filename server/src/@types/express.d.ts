import User from "../models/user";

interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  password: string;
}


declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}