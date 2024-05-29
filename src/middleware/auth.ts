import { RequestHandler } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken"
import PassResetModel from "src/models/passwordResetToken";
import UserModel from "src/models/user";
import { sendErrorRes } from "src/utils/helper";

const JWT_SECRET = process.env.JWT_SECRET!

interface UserProfile {
    id: string
    name: string
    email: string
    verified: boolean
}

declare global {
    namespace Express {
        interface Request {
            user: UserProfile
        }
    }
}

//判断是否登陆
export const isAuth: RequestHandler = async (req, res, next) => {

    try {
        const authToken = req.headers.authorization;
        if (!authToken) {
            return res.status(403).json({ message: "无法自动登陆" });
        }

        const token = authToken.split("Bearer ")[1]
        const payload = jwt.verify(token, JWT_SECRET) as { id: string }

        const user = await UserModel.findById(payload.id)
        if (!user) {
            return res.status(403).json({ message: "找不到用户" });
        }

        req.user = {
            id: user._id as string,
            name: user.name,
            email: user.email,
            verified: user.verified,
        }

        next()
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            return res.status(401).json({ message: "token过期" });
        }

        if (error instanceof JsonWebTokenError) {
            return res.status(401).json({ message: "token无效" });
        }

        next(error)
    }

};

export const isValidPassResetToken: RequestHandler = async (req, res, next) => {

    const { id, token } = req.body
    const resetToken = await PassResetModel.findOne({ owner: id })
    if (!resetToken) return sendErrorRes(res, "找不到重置密码的token", 403)

    const isMatched = await resetToken.compareToken(token)
    if (!isMatched) return sendErrorRes(res, "token不一致或者已过期", 403)

    next()
};