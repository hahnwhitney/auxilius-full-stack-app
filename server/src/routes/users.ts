import { Router } from "express";
import { authenticateUser, getUserByUsername, insertUser } from "../db.js";
import { createUserSchema, loginSchema } from "../schemas.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const result = createUserSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0].message });
      return;
    }
    const { username, password } = result.data;
    const existing = await getUserByUsername(username);
    if (existing) {
      res.status(409).json({ error: "Username already taken" });
      return;
    }
    const user = await insertUser(username, password);
    res.status(201).json(user);
  } catch (err) {
    console.error("Failed to create user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0].message });
      return;
    }
    const { username, password } = result.data;
    const user = await authenticateUser(username, password);
    if (!user) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error("Failed to authenticate user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as userRouter };
