import { setWarningCookie, fillWarning, getAuth } from "/assets/js/base.js"

const authStatus = await getAuth()

if(!authStatus){
    window.location.href = "/auth/login/"
}else if(authStatus === "pending_confirmation"){
    window.location.href = "/auth/confirmToken/"
}

const form      = document.querySelector("form")
const submitBtn = document.querySelector(".btn.submit")

if(form && submitBtn){
    form.addEventListener("submit", (e) => {
        e.preventDefault()

        const typedToken = document.querySelector("#iuserToken")

        if(typedToken){
            createToken(typedToken.value)
            console.log(typedToken.value)
        }else{
            setWarningCookie("dberror", 0)
            window.location.href = "/auth/newToken/"
        }
    })
}

async function createToken(typedToken){
    try{
        const response = await fetch("/api/me/token", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                typedToken: typedToken
            })
        })

        if(!response.ok){
            const errorData = await response.json()
            fillWarning(errorData.error, 0)
            return
        }

        const data = await response.json()

        setWarningCookie(data.message, 1)
        window.location.href = "/auth/login/"
    }catch(err){
        fillWarning("dberror", 0)
        console.error("Server error: ", err)
    }
}