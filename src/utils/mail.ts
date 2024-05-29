import nodemailer from 'nodemailer'

const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.MAIL_TRAN_USER,
        pass: process.env.MAIL_TRAN_PASSWORD
    }
});

const sendVerification = async (email: string, link: string) => {
    //发送邮件验证邮箱

    await transport.sendMail({
        from: "verification@myapp.com",
        to: email,
        subject: "Verify your email",
        html: `
          <p>请点击下面链接来进行邮箱验证:</p>
          <a href="${link}">Here!</a>
        `
    })
}

const sendPasswordResetLink = async (email: string, link: string) => {

    await transport.sendMail({
        from: "security@myapp.com",
        to: email,
        subject: "Reset password",
        html: `
          <p>请点击下面链接来更新密码:</p>
          <a href="${link}">Here!</a>
        `
    })
}

const sendPasswordUpdated = async (email: string) => {

    await transport.sendMail({
        from: "security@myapp.com",
        to: email,
        html: `
          <h1>密码更新成功，现在可以使用新密码进行登录啦！</h1>
        `
    })
}

export const mail = {
    sendVerification,
    sendPasswordResetLink,
    sendPasswordUpdated
}