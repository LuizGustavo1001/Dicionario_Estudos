import { setWarningCookie, fillWarning, getAuth } from "/assets/js/base.js"

// verify session
const authStatus = await getAuth()

if(authStatus){
    window.location.href = "/dashboard"
}else if(authStatus === "pending_confirmation"){
    window.location.href = "/auth/confirmToken"
}

const form      = document.querySelector("form")
const submitBtn = document.querySelector(".btn.submit")

if(form && submitBtn){
    form.addEventListener("submit", (e) => {
        e.preventDefault()

        if(! form.checkValidity()){
            fillWarning("formNotFilled", 0)
            return
        }

        const usernameValue = document.querySelector("#iuserName").value
        const passwordValue = document.querySelector("#ipassword").value

        register(usernameValue, passwordValue)
    })
}

 async function register(username, password){
    try{
        const response = await fetch("/users/register", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({ 
                username: username,
                password: password
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            fillWarning(errorData.error, 0)
            return
        }

        const data = await response.json()

        // redirect to login + message
        setWarningCookie(data.message, 1)
        window.location.href = "/auth/login/"
    }catch(err){
        fillWarning(data.error, 0)
        console.error("Server error", err)
    }
}