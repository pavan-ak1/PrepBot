import type { Request, Response } from "express";
import { userModel } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide valid credentials",
    });
  }

  const isUserAlreadyExists = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserAlreadyExists) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    username,
    email,
    password: hashedPassword,
  });

  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET not found");
  }

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: "10d",
    },
  );

  res.status(201).json({
    success: true,
    message: "User created successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
    token,
  });
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({
    $or: [{ email: email }, { username: email }]
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid password",
    });
  }

  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET not found");
  }

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: "10d",
    },
  );

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
    token,
  });
};

export const logoutUser = async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
};

export const getMeUser = async (req: Request, res: Response) => {
  const user = await userModel.findById(req.user?.id);

  res.status(200).json({
    message: "User details fetched successfully",
    user: {
      id: user?._id,
      username: user?.username,
      email: user?.email,
    },
  });
};
