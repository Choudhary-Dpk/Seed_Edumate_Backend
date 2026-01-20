import express, { Application, Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from "path";

const app: Application = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,  // ← Disable helmet's CSP so we can set our own
}));
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(express.static(path.join(__dirname, "../../public"))); 

export default app;