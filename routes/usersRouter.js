import express from "express";
import validateBody from "../helpers/validateBody.js";
import { userSchema, resendVerifySchema } from "../schemas/usersSchemas.js";
import { 
    register,
    login,
    logout,
    getUser,
    updateAvatar,
    verifyUser,
    resendVerify,
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
usersRouter.get("/verify/:verificationToken", jsonParser, verifyUser)
usersRouter.post("/verify", jsonParser, validateBody(resendVerifySchema), resendVerify)

export default usersRouter;