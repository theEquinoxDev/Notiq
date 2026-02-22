import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import notesRoutes from "./routes/notes.routes.js";
import errorHandler from "./middlewares/error.middleware.js";

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((o: string) => o.trim())
  : ["http://localhost:5173"];

const app = express();

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());


app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/notes", notesRoutes);

app.use(errorHandler);

export default app;
