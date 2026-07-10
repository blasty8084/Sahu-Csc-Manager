import { Router, type IRouter } from "express";
import customersRouter from "./customers";
import entriesRouter from "./entries";

const router: IRouter = Router();

router.use(customersRouter);
router.use(entriesRouter);

export default router;
