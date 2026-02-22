import { Router } from "express";
import { getUserByUsername, insertUser } from "../db.js";
import { createUserSchema } from "../schemas.js";

const router = Router();

router.get("/:username", async (req, res) => {
  try {
    const user = await getUserByUsername(req.params.username);
    if (user) {
      res.json({ exists: true });
    } else {
      res.status(404).json({ exists: false });
    }
  } catch (err) {
    console.error("Failed to look up user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const result = createUserSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0].message });
      return;
    }
    const { username } = result.data;
    const existing = await getUserByUsername(username);
    if (existing) {
      res.status(409).json({ error: "Username already taken" });
      return;
    }
    const user = await insertUser(username);
    res.status(201).json(user);
  } catch (err) {
    console.error("Failed to create user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as userRouter };
