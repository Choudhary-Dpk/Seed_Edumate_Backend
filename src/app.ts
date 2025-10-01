import {  hubspotRoutes } from './routes/hubspot.routes';
import { swaggerRouter } from './config/swagger';
import { checkPrismaConnection } from './config/prisma';
import { gupshupRoutes } from './routes/gupshup.routes';
import { loanRoutes } from './routes/loan.routes';
import { userRoutes } from './routes/user.routes';
import { emailRouter } from './routes/email.routes';
import { healthRoutes } from "./routes/health.routes";
import { loanApplicationRouter } from "./routes/loanApplication.routes";
import { errorHandler } from "./middlewares/error";
import { partnerRoutes } from "./routes/partner.routes";
import { contactRoutes } from "./routes/contact.routes";
import { permissionsRoutes } from "./routes/permissions.routes";
import app from "./setup/express";

const PORT = process.env.PORT || 3031;

// API Routes
app.use("/loans", loanRoutes);
app.use("/hubspot", hubspotRoutes);
app.use("/contacts", contactRoutes);
app.use("/gupshup", gupshupRoutes);
app.use("/health", healthRoutes);
app.use("/user", userRoutes);
app.use("/email", emailRouter);
app.use("/loanApplications", loanApplicationRouter);
app.use("/partners", partnerRoutes);
app.use("/permissions", permissionsRoutes);

// API Documentation - Make sure this comes before other routes
app.use("/docs", swaggerRouter);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Edumate Integration API",
    documentation: "/docs",
    version: "1.0.0",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, async() => {
    console.log(`Server is running on port ${PORT}`);
    await checkPrismaConnection(); 
    // console.log(`API Documentation available at http://localhost:${PORT}/`);
});