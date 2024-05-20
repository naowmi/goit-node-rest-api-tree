import express from "express";
import validateBody from "../helpers/validateBody.js";
import { userSchema } from "../schemas/usersSchemas.js";
import { 
    register,
    login,
    logout,
    getUser,
 } from "../controllers/usersController.js";
import { authMiddleware } from "../middleware/auth.js";
const usersRouter = express.Router();
const jsonParser = express.json();
usersRouter.post("/register", jsonParser, validateBody(userSchema), register);
usersRouter.post("/login", jsonParser, validateBody(userSchema), login)
usersRouter.get("/logout", authMiddleware, logout)
usersRouter.get("/current", jsonParser, authMiddleware, getUser)

export default usersRouter;