import { Request, Response } from "express";
import argon2 from "argon2";
import { prisma } from "../utils/prisma.js";
import { createSession, deleteSession, SESSION_COOKIE_NAME } from "../utils/session.js";
import { registerSchema, loginSchema } from "../schemas/auth.ts";
import { User } from "@prisma/client";
import { parseCookies } from "../middleware/auth.ts";

function sanitizeUser(user: User) {
  const { passwordHash, ...sanitized } = user;
  return sanitized;
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { name, email, password } = parseResult.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }

    const passwordHash = await argon2.hash(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "MEMBER",
      },
    });

    const { token, expiresAt } = await createSession(user.id);

    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    res.status(201).json({
      data: {
        user: sanitizeUser(user),
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error during registration" });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.active) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const { token, expiresAt } = await createSession(user.id);

    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    res.status(200).json({
      data: {
        user: sanitizeUser(user),
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error during login" });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[SESSION_COOKIE_NAME] || req.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (token) {
      await deleteSession(token);
    }

    res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
    res.status(200).json({ data: { message: "Logged out successfully" } });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error during logout" });
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }

  res.status(200).json({
    data: {
      user: sanitizeUser(req.user),
    },
  });
}
