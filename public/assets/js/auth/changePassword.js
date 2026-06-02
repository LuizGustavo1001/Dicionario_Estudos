import { setWarningCookie, fillWarning, getAuth, getCookie } from "/assets/js/base.js"

const authStatus = await getAuth()

if(authStatus === "confirmed"){
    window.location.href = "/dashboard"
}else if(authStatus === "pending_confirmation"){
    window.location.href = "/auth/confirmToken"
}

const form      = document.querySelector("form")
const submitBtn = document.querySelector(".btn.submit")

if(form && submitBtn){
    form.addEventListener("submit", (e) => {
        e.preventDefault()

        const currentUsername   = document.querySelector("#iusername")
        const newPassword       = document.querySelector("#iuserToken")

        if(currentUsername && newPassword){
            /* 
            após trocar nome de senha é necessário deixar o token como não confirmado
            */

            /*
            const response = await fetch("/users/me/edit/password", {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ 
                    currentUsername: currentUsername,
                    newPassword: newPassword
                })
            })

            if (!response.ok) { 
                const errorData = await response.json()
                fillWarning(errorData.error, 0)
                return
            }

            const data = await response.json()

            setWarningCookie(data.message, 1)
            window.location.href = "/auth/login"
            */ 
        }else{
            setWarningCookie("dberror", 0)
            window.location.href = "/auth/changePassword"
        }
    })
}