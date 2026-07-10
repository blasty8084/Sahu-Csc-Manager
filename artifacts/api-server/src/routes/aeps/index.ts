import { Router, type IRouter } from "express";
import sessionsRouter from "./sessions";
import transactionsRouter from "./transactions";

const router: IRouter = Router();

router.use(sessionsRouter);
router.use(transactionsRouter);

export default router;
