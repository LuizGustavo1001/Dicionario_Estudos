import { setWarningCookie, fillWarning, getAuth } from "/assets/js/base.js"

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

        submitBtn.classList.add("waiting")

        const usernameInput = document.querySelector("#iuserName")
        const passwordInput = document.querySelector("#ipassword")
    
        if(usernameInput && passwordInput){
            register(usernameInput.value.trim(), passwordInput.value.trim())
        }else{
            setWarningCookie("dberror", 0)
            window.location.href = "/auth/register/"
        }
    })
}

 async function register(username, password){
    try{
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({ 
                username: username,
                password: password
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