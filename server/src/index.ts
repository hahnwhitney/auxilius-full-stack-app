import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { connectDb } from "./db.js";
import { createTaskRouter } from "./routes/tasks.js";
import { userRouter } from "./routes/users.js";
import { registerTaskSocketHandlers } from "./sockets/tasks.js";

const app = express();
app.use(express.json());
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/tasks", createTaskRouter(io));
app.use("/api/users", userRouter);

registerTaskSocketHandlers(io);

const PORT = Number(process.env.PORT) || 3001;

async function start() {
  await connectDb();
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
