import { Router, type IRouter } from "express";
import registerRouter from "./register";
import loginRouter from "./login";
import sessionRouter from "./session";
import appealRouter from "./appeal";
import otpRouter from "./otp";
import forgotPasswordRouter from "./forgot-password";
import resetPasswordRouter from "./reset-password";

const router: IRouter = Router();

router.use(registerRouter);
router.use(loginRouter);
router.use(sessionRouter);
router.use(appealRouter);
router.use(otpRouter);
router.use(forgotPasswordRouter);
router.use(resetPasswordRouter);

export default router;
