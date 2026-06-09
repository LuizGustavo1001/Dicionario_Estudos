import { setWarningCookie, fillWarning, getAuth } from "/assets/js/base.js"

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

        const usernameInput = document.querySelector("#iuserName")
        const passwordInput = document.querySelector("#ipassword")
    
        if(usernameInput && passwordInput){
            login(usernameInput.value, passwordInput.value)
        }else{
            setWarningCookie("dberror", 0)
            window.location.href = "/auth/login/"
        }
    })
}

async function login(username, password){
    try{
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ 
                username: username,
                password: password
            })
        })

        if(!response.ok){
            const errorData = await response.json()
            fillWarning(errorData.error, 0)
            return
        }

        const data = await response.json()

        setWarningCookie(data.message, 1)
        window.location.href = "/dashboard"
    }catch(err){
        fillWarning("dberror", 0)
        console.error("Server error: ", err)
    }
}