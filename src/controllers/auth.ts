import { RequestHandler } from "express";
import UserModel from "src/models/user";
import crypto from "crypto"
import AuthTokenModel from "src/models/authToken";
import nodemailer from 'nodemailer'
import { sendErrorRes } from "src/utils/helper";
import jwt from "jsonwebtoken"
import { access } from "fs";
import { mail } from "src/utils/mail";
import PassResetModel from "src/models/passwordResetToken";


const VERIFICATION_LINK = process.env.VERIFICATION_LINK
const JWT_SECRET = process.env.JWT_SECRET!
const PASSWORD_RESET_LINK = process.env.PASSWORD_RESET_LINK

export const createNewUser: RequestHandler = async (req, res) => {

    const { email, password, name } = req.body;

    //验证邮箱是否已存在
    const user = await UserModel.findOne({ email })

    if (user) {
        return sendErrorRes(res, "email already exists", 401)
    }

    //创建新用户和token
    const newUser = await UserModel.create({ email, password, name })

    const token = crypto.randomBytes(32).toString('hex')

    await AuthTokenModel.create({ owner: newUser._id, token })

    const link = `${VERIFICATION_LINK}?id=${newUser._id}&token=${token}`

    await mail.sendVerification(newUser.email, link)

    res.json({ message: "请查看邮箱." });

}

export const verifyEmail: RequestHandler = async (req, res) => {

    const { id, token } = req.body

    const authToken = await AuthTokenModel.findOne({ owner: id })

    if (!authToken) return sendErrorRes(res, "未经允许的token", 403)

    const isMatched = await authToken.compareToken(token)

    if (!isMatched) return sendErrorRes(res, "token错误", 403)

    await UserModel.findByIdAndUpdate(id, { verified: true })

    await AuthTokenModel.findByIdAndDelete(authToken._id)

    res.json({ message: "邮箱验证成功！" })
}

export const singIn: RequestHandler = async (req, res) => {

    const { email, password } = req.body

    const user = await UserModel.findOne({ email })

    if (!user) return sendErrorRes(res, "用户不存在", 403)

    const isMatched = await user.comparePassword(password)

    if (!isMatched) return sendErrorRes(res, "密码错误", 403)

    const payload = { id: user._id }
    const accessToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: "15m"
    })
    const refreshToken = jwt.sign(payload, JWT_SECRET)

    if (!user.tokens) user.tokens = [refreshToken]
    else user.tokens.push(refreshToken)

    await user.save()

    res.json({
        profile: {
            id: user.id,
            name: user.name,
            email: user.email,
            verified: user.verified,
        },
        tokens: { refresh: refreshToken, access: accessToken }
    })
}

export const sendProfile: RequestHandler = async (req, res) => {

    res.json({
        profile: { ...req.user }
    })
}

export const generateVerificationLink: RequestHandler = async (req, res) => {

    const { id } = req.user
    const token = crypto.randomBytes(32).toString('hex')

    const link = `${VERIFICATION_LINK}?id=${id}&token=${token}`

    await AuthTokenModel.findOneAndDelete({ owner: id })

    await AuthTokenModel.create({ owner: id, token })

    await mail.sendVerification(req.user.email, link)

    res.json({ message: "请查看邮箱." });
}

export const grantAccessToken: RequestHandler = async (req, res) => {

    const { refreshToken } = req.body

    if (!refreshToken) return sendErrorRes(res, "未经授权的请求", 403)

    const payload = jwt.verify(refreshToken, JWT_SECRET) as { id: string }

    if (!payload.id) sendErrorRes(res, "未经授权的请求", 401)

    const user = await UserModel.findOne({ _id: payload.id, tokens: refreshToken })

    if (!user) {
        //用户被破坏，删除之前所有的token
        await UserModel.findByIdAndUpdate(payload.id, { tokens: [] })
        return sendErrorRes(res, "未经授权的请求", 401)
    }

    const newAccessToken = jwt.sign({ id: user._id }, JWT_SECRET, {
        expiresIn: "15m"
    })
    const newRefreshToken = jwt.sign({ id: user._id }, JWT_SECRET)

    user.tokens = user.tokens.filter((t) => t !== refreshToken)
    await user.save()

    res.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    })

}

export const signOut: RequestHandler = async (req, res) => {

    const { refreshToken } = req.body

    const user = await UserModel.findOne({ _id: req.user.id, tokens: refreshToken })

    if (!user) return sendErrorRes(res, "未找到用户", 403)

    const newTokens = user.tokens.filter((t) => t !== refreshToken)

    user.tokens = newTokens
    await user.save()

    res.send()

}

export const forgetPass: RequestHandler = async (req, res) => {

    const { email } = req.body

    const user = await UserModel.findOne({email})

    if(!user) return sendErrorRes(res, "用户不存在", 404)
    
    await PassResetModel.findOneAndDelete({owner: user._id})

    const token = crypto.randomBytes(32).toString('hex')

    PassResetModel.create({owner: user._id, token})

    const resetLink = `${PASSWORD_RESET_LINK}?id=${user._id}&token=${token}`

    await mail.sendPasswordResetLink(user.email, resetLink)

    res.json({ message: "请查看邮箱，并于1小时内修改" });
}

export const grantValid: RequestHandler = async (req, res) => {

    res.json({ valid: true });
}

export const updatePassword: RequestHandler = async (req, res) => {

    const { id, password } = req.body
    const user = await UserModel.findById(id)

    if (!user) return sendErrorRes(res, "用户不存在", 403)

    const isSamePass = await user.comparePassword(password)

    if (isSamePass) return sendErrorRes(res, "新密码不能与旧密码相同", 422)
    
    user.password = password

    await user.save()

    await PassResetModel.findOneAndDelete({owner: user._id})

    await mail.sendPasswordUpdated(user.email)

    res.json({ message: "密码重置成功！" });
}