import { Router } from "express";
import authRoutes      from "../modules/auth/auth.routes";
import employeeRoutes  from "../modules/employee/employee.routes";
import mastersRoutes   from "../modules/masters/masters.routes";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";

const router = Router();

router.use("/auth",      authRoutes);
router.use("/employees", employeeRoutes);
router.use("/masters",   mastersRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
