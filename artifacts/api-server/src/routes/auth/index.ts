import { Router, type IRouter } from "express";
import registerRouter from "./register";
import loginRouter from "./login";
import sessionRouter from "./session";
import appealRouter from "./appeal";

const router: IRouter = Router();

router.use(registerRouter);
router.use(loginRouter);
router.use(sessionRouter);
router.use(appealRouter);

export default router;
