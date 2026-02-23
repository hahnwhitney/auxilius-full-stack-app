import "express-session";
import type { Session, SessionData } from "express-session";

declare module "express-session" {
  interface SessionData {
    userId: string;
    username: string;
  }
}

declare module "http" {
  interface IncomingMessage {
    session: Session & Partial<SessionData>;
  }
}
