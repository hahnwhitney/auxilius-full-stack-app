import { Router } from "express";
import { getUserByUsername, insertUser } from "../db.js";

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
    const { username } = req.body;
    if (
      !username ||
      typeof username !== "string" ||
      username.trim().length === 0
    ) {
      res.status(400).json({ error: "Username is required" });
      return;
    }
    const existing = await getUserByUsername(username.trim());
    if (existing) {
      res.status(409).json({ error: "Username already taken" });
      return;
    }
    const user = await insertUser(username.trim());
    res.status(201).json(user);
  } catch (err) {
    console.error("Failed to create user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as userRouter };
