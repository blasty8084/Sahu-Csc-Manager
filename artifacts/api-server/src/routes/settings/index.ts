import { Router, type IRouter } from "express";
import generalRouter from "./general";
import backupsRouter from "./backups";
import smtpRouter from "./smtp";
import vapidRouter from "./vapid";

const router: IRouter = Router();

router.use(generalRouter);
router.use(backupsRouter);
router.use(smtpRouter);
router.use(vapidRouter);

export default router;
