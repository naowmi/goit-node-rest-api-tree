import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import jimp from "jimp";
import * as fs from "node:fs/promises";
import path from "node:path";

export const register = async (req, res, next) => {
    const { email, password } = req.body;
       const emailInLowerCase = email.toLowerCase();
    try { 
       const user = await User.findOne({email: emailInLowerCase});
       if (user !== null) {
        res.status(409).send({message: "Email in use"});
       }
       const passwordHash = await bcrypt.hash(password, 10);
       const generatedGravatar = gravatar.url(emailInLowerCase);

       await User.create({
        email: emailInLowerCase,
        password: passwordHash,
        avatarURL: `http:${generatedGravatar}`,
    });
       res.status(201).send({message: "Registration successfully"});
    } catch (error) {
        next(error)
    }
}

export const login = async (req, res, next) => {
    const { email, password } = req.body;
    const emailInLowerCase = email.toLowerCase();
    try {
       const user = await User.findOne({email: emailInLowerCase});
       if (!user) {
        res.status(401).send({message: "Email or password incorrect"})
       }
      const isMatch = await bcrypt.compare(password, user.password) 
      if (!isMatch) {
        res.status(401).send({message: "Email or password incorrect"})
      }
      const token = jwt.sign({
        id: user._id,
        email: user.email,
      }, process.env.JWT_SECRET,
       {expiresIn: "2 days"})
       await User.findByIdAndUpdate(user._id, { token });
       res.send({ token });
    } catch (error) {
        next(error)
    }
}

export const logout = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user.id, {token: null});
        res.status(204).end();
    } catch (error) {
        next(error)
    }
}

export const getUser = async (req, res, next) => {
    try {
    const user = await User.findById(req.user.id)
    const { email, subscription } = user
        res.status(200).send({ email, subscription });
    } catch(error) {
        next(error)
    }
}
export const updateAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).send({message: "Please select the avatar"})
        }

        const userAvatar = await jimp.read(req.file.path);
        await userAvatar.resize(250, 250).writeAsync(req.file.path);
        fs.rename(req.file.path, path.resolve("public/avatars", req.file.filename))

       const user = await User.findByIdAndUpdate(req.user.id, {avatarURL: req.file.filename}, { new: true });

       res.status(200).send({ avatarURL: `/avatars/${user.avatarURL}` });
    } catch (error) {
        res.status(401).send({message: "Not authorized"})
    }
}