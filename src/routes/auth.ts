import { Router } from "express";
import { createNewUser, forgetPass, generateVerificationLink, grantAccessToken, grantValid, sendProfile, signOut, singIn, updatePassword, verifyEmail } from "controllers/auth";
import validate from "src/middleware/validator";
import { newUserSchema, resetPassSchema, verifyTokenSchema } from "src/utils/validationSchema";
import { verify } from "crypto";
import { isAuth, isValidPassResetToken } from "src/middleware/auth";

const authRouter = Router();

authRouter.post("/sign-up", validate(newUserSchema), createNewUser)
authRouter.post("/verify", validate(verifyTokenSchema), verifyEmail)
authRouter.get("/verify-token", isAuth, generateVerificationLink)
authRouter.post("/sign-in", singIn)
authRouter.get("/profile",  isAuth, sendProfile)
authRouter.post("/refresh-token", grantAccessToken)
authRouter.post("/sign-out", isAuth, signOut)
authRouter.post("/forget-pass", forgetPass)
authRouter.post("/verify-pass-reset-token", validate(verifyTokenSchema), isValidPassResetToken, grantValid)
authRouter.post("/reset-pass", validate(resetPassSchema), isValidPassResetToken, updatePassword)


export default authRouter;