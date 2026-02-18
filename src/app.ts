import { checkPrismaConnection } from "./config/prisma";
import { gupshupRoutes } from "./routes/gupshup.routes";
import { loanRoutes } from "./routes/loan.routes";
import { userRoutes } from "./routes/user.routes";
import { emailRouter } from "./routes/email.routes";
import { loanApplicationRouter } from "./routes/loanApplication.routes";
import { errorHandler } from "./middlewares/error";
import { partnerRoutes } from "./routes/partner.routes";
import { contactRoutes } from "./routes/contact.routes";
import { permissionsRoutes } from "./routes/permissions.routes";
import { masterRoutes } from "./routes/index.routes";
import app from "./setup/express";
import "./setup/cron";
import { loanProuductRoutes } from "./routes/loanProudct.routes";
import { commissionRoutes } from "./routes/commission.routes";
import { lenderRoutes } from "./routes/lender.routes";
import { adminRoutes } from "./routes/admin/index.routes";
import { startWorkers } from "./workers";
import { studentRoutes } from "./routes/student.routes";
import { redirectRoutes } from "./routes/redirect.routes";
import { setupPm2Logrotate } from "./utils/pm2-logrotate.utils";
import { testimonialRoutes } from "./routes/testimonials.route";
import { sendResponse } from "./utils/api";
import { programOfInterestRoutes } from "./routes/programOfInterest";
import { accommodationRoutes } from "./routes/accommodation.routes";
import { docsRoutes } from "./routes/docs.routes";
import { misReportRoutes } from "./routes/misReport.routes";
import { dashboardRoutes } from "./routes/dashboard.routes";
import { startEmailQueueWorker } from "./workers/email-queue-worker";
const PORT = process.env.PORT || 3031;

// API Routes
app.use("/loans", loanRoutes);
app.use("/contacts", contactRoutes);
app.use("/gupshup", gupshupRoutes);
app.use("/user", userRoutes);
app.use("/email", emailRouter);
app.use("/loanApplications", loanApplicationRouter);
app.use("/partners", partnerRoutes);
app.use("/permissions", permissionsRoutes);
app.use("/master", masterRoutes);
app.use("/loanProduct", loanProuductRoutes);
app.use("/commission", commissionRoutes);
app.use("/lenders", lenderRoutes);
app.use("/admin", adminRoutes);
app.use("/student", studentRoutes);
app.use("/testimonials", testimonialRoutes);
app.use("/accom", accommodationRoutes);
app.use("/programs-of-interest", programOfInterestRoutes);
app.use("/api-docs", docsRoutes);
app.use("/mis-report", misReportRoutes);
app.use("/admin/dashboard", dashboardRoutes);
app.use("/", redirectRoutes);

// 404 handler
app.use("*", (req, res) => {
  sendResponse(res, 404, "Route not found");
});

// Error handler
app.use(errorHandler);

setupPm2Logrotate();

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await checkPrismaConnection();

  //  Start HS sync workers
  // await startWorkers();

  // Start email worker on app startup
  startEmailQueueWorker();
});
