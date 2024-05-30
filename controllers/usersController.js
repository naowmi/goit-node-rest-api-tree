import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import jimp from "jimp";
import * as fs from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import mail from "../mail.js"
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
       const verifyToken = nanoid();
       await User.create({
        email: emailInLowerCase,
        password: passwordHash,
        verificationToken: verifyToken,
        avatarURL: `http:${generatedGravatar}`,
    });
    mail.sendMail({
        to: emailInLowerCase,
        from: "vadimpelyushenko@gmail.com",
        subject: "Confirm your account!",
        html: `To confirm your email please click on the <a href="http://localhost:3000/users/verify/${verifyToken}">link</a>`,
        text: `To confirm your email please open the link http://localhost:3000/users/verify/${verifyToken}`

    })
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

       if (user.verify === false) {
        res.status(401).send({message: "Please verify your email"})
       }

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

export const verifyUser = async (req, res, next) => {
    const {verificationToken} = req.params;
    try {
        const user = await User.findOne({verificationToken})
        if (user === null) {
            return res.status(404).send({message: "User not found"})
        }
        await User.findByIdAndUpdate(user._id, {verificationToken: null, verify: true});
        res.status(200).send({message: "Verification successful"})

    } catch (error) {
        next(error)
    }
}

export const  resendVerify = async (req, res, next) => {
    const { email } = req.body;
    const emailInLowerCase = email.toLowerCase();
    const verifyToken = nanoid();
    try {
      if (!email) {
        return res.status(400).send({message: "Missing required field email"})
      } 
      const user = await User.findOne({email})
      if (user.verify === true) {
        return res.status(400).send({message: "Verification has already been passed"})
      }
      await User.findByIdAndUpdate(user._id, {verificationToken: verifyToken})
      mail.sendMail({
        to: emailInLowerCase,
        from: "vadimpelyushenko@gmail.com",
        subject: "Confirm your account!",
        html: `To confirm your email please click on the <a href="http://localhost:3000/users/verify/${verifyToken}">link</a>`,
        text: `To confirm your email please open the link http://localhost:3000/users/verify/${verifyToken}`
    })
    res.status(200).send({message: "Verification email sent"})
    } catch (error) {
        next(error)
    }
}