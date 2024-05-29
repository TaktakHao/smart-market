const form = document.getElementById("form")
const messageTag = document.getElementById("message")
const password = document.getElementById("password")
const confirmPassword = document.getElementById("confirm-password")
const notification = document.getElementById("notification")
const submit = document.getElementById("submit")

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/

form.style.display = "none"

let token, id;

window.addEventListener("DOMContentLoaded", async () => {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => {
            return searchParams.get(prop)
        },
    });

    token = params.token;
    id = params.id;

    const res = await fetch('/auth/verify-pass-reset-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            token,
            id
        })
    })

    if (!res.ok) {
        const { message } = await res.json()
        messageTag.innerText = message
        messageTag.classList.add("error")
        return
    }

    messageTag.style.display = "none"
    form.style.display = "block"
})

const displayNotification = (message, type) => {
    notification.style.display = "block"
    notification.innerText = message
    notification.classList.add(type)
}
const handleSubmit = async (ev) => {
    ev.preventDefault()

    if (!passwordRegex.test(password.value) || !confirmPassword.value.trim()) {
        return displayNotification("请输入正确密码", "error")
    }

    if (password.value.trim() !== confirmPassword.value.trim()) {
        return displayNotification("两次输入的密码不匹配", "error")
    }

    submit.disable = true
    submit.innerText = "提交中..."

    const res = await fetch('/auth/reset-pass', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            id,
            token,
            password: password.value
        })
    })

    if (!res.ok) {
        const { message } = await res.json()
        submit.disable = false
        submit.innerText = "确认提交"
        return displayNotification(message, "error")
    }

    messageTag.style.display = "block"
    messageTag.innerText = "密码重置成功!"
    messageTag.classList.add("success")

    form.style.display = "none"
}

form.addEventListener("submit", handleSubmit)