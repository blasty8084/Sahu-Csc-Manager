import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import ledgerRouter from "./ledger";
import servicesRouter from "./services";
import usersRouter from "./users";
import notificationsRouter from "./notifications";
import auditRouter from "./audit";
import settingsRouter from "./settings";
import reportsRouter from "./reports";
import aepsRouter from "./aeps";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(ledgerRouter);
router.use(servicesRouter);
router.use(usersRouter);
router.use(notificationsRouter);
router.use(auditRouter);
router.use(settingsRouter);
router.use(reportsRouter);
router.use(aepsRouter);

export default router;
