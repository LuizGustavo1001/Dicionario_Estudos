import { setWarningCookie, fillWarning, getAuth } from "/assets/js/base.js"

const authStatus = await getAuth()

if(authStatus === "confirmed"){
    window.location.href = "/dashboard/"
}else if(authStatus === "pending_confirmation"){
    window.location.href = "/auth/confirmToken/"
}

const form      = document.querySelector("form")
const submitBtn = document.querySelector(".btn.submit")

if(form && submitBtn){
    form.addEventListener("submit", (e) => {
        e.preventDefault()

        submitBtn.classList.add("waiting")

        const currentUsername   = document.querySelector("#iusername")
        const newPassword       = document.querySelector("#inewPassword")
        const typedToken        = document.querySelector("#iuserToken")

        if(currentUsername && newPassword && typedToken){
            changePassword(currentUsername.value.trim(), newPassword.value.trim(), typedToken.value.trim())
        }else{
            setWarningCookie("dberror", 0)
            window.location.href = "/auth/changePassword/"
        }
    })
}

async function changePassword(currentUsername, newPassword, typedToken){
    try{
        const response = await fetch("/api/me/password", {
            method: "PATCH",
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                currentUsername: currentUsername,
                newPassword: newPassword,
                typedToken: typedToken
            })
        })

        if(!response.ok){
            submitBtn.classList.remove("waiting")
            const errorData = await response.json()
            fillWarning(errorData.error, 0)
            return
        }

        const data = await response.json()

         submitBtn.classList.remove("waiting")
        setWarningCookie(data.message, 1)
        window.location.href = "/auth/login/"
    }catch(err){
        fillWarning("dberror", 0)
        console.error("Server error: ", err)
    }
}