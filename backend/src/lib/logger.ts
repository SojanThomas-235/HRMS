import { env } from "../config/env";

type Level = "info" | "warn" | "error" | "debug";

function log(level: Level, message: string, meta?: unknown) {
  if (env.NODE_ENV === "test") return;
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta } : {}),
  };
  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  info:  (msg: string, meta?: unknown) => log("info",  msg, meta),
  warn:  (msg: string, meta?: unknown) => log("warn",  msg, meta),
  error: (msg: string, meta?: unknown) => log("error", msg, meta),
  debug: (msg: string, meta?: unknown) => {
    if (env.NODE_ENV === "development") log("debug", msg, meta);
  },
};
