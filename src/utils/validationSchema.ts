import { isValidObjectId } from 'mongoose';
import * as yup from 'yup'

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/

yup.addMethod(yup.string, 'email', function validateEmail(message) {
    return this.matches(emailRegex, {
        message,
        name: 'email',
        excludeEmptyString: true,
    });
});

const password = {
    password: yup.string().required("请输入密码").min(6, "请至少输入6个字符").matches(passwordRegex, "密码太简单了，需包含字母和数字")
}
export const newUserSchema = yup.object({
    name: yup.string().required("请输入名字"),
    email: yup.string().email("无效邮箱!").required("请输入邮箱"),
    ...password
})

const tokenAndId = {
    id: yup.string().test({
        name: "valid-id",
        message: "不合法的id",
        test: (value) => {
            return isValidObjectId(value)
        }
    }),
    token: yup.string().required("token不见了")
}
export const verifyTokenSchema = yup.object({
    ...tokenAndId
})

export const resetPassSchema = yup.object({
    ...tokenAndId,
    ...password
})