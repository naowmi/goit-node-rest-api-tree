import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
    const { email, password } = req.body;
       const emailInLowerCase = email.toLowerCase();
    try { 
       const user = await User.findOne({email: emailInLowerCase});
       if (user !== null) {
        res.status(409).send({message: "Email in use"});
       }
       const passwordHash = await bcrypt.hash(password, 10);
       await User.create({
        email: emailInLowerCase,
        password: passwordHash,
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