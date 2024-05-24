import express from "express";
import validateBody from "../helpers/validateBody.js";
import { userSchema } from "../schemas/usersSchemas.js";
import { 
    register,
    login,
    logout,
    getUser,
    updateAvatar,
 } from "../controllers/usersController.js";
import { authMiddleware } from "../middleware/auth.js";
import uploadMiddleware from "../middleware/avatar.js";
const usersRouter = express.Router();
const jsonParser = express.json();
usersRouter.post("/register", jsonParser, validateBody(userSchema), register);
usersRouter.post("/login", jsonParser, validateBody(userSchema), login)
usersRouter.get("/logout", authMiddleware, logout)
usersRouter.get("/current", jsonParser, authMiddleware, getUser)
usersRouter.patch("/avatars", authMiddleware, uploadMiddleware.single("avatar"), updateAvatar)

export default usersRouter;