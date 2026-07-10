import { Router, type IRouter } from "express";
import generalRouter from "./general";
import backupsRouter from "./backups";

const router: IRouter = Router();

router.use(generalRouter);
router.use(backupsRouter);

export default router;
