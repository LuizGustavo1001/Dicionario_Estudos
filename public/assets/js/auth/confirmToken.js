import { setWarningCookie, fillWarning, getAuth, getCookie } from "/assets/js/base.js"

const authStatus = await getAuth()

if(authStatus === "confirmed"){
    window.location.href = "/dashboard"
}else if(!authStatus){
    window.location.href = '/auth/login'
}

// retrieve backend token
const rawToken = getCookie('display_token')

if(rawToken){
    const tokenDisplay = document.querySelector("#token")
    if(tokenDisplay){
        tokenDisplay.innerHTML = rawToken
    }
    
    document.cookie = "display_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
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

        const typedToken = document.querySelector("#iuserToken").value

        verifyToken(typedToken)
    })
}

async function verifyToken(typedToken){
    try{
        const response = await fetch("/users/auth/confirmToken", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include", // accept cookies
            body: JSON.stringify({ 
                typedToken: typedToken
            })
        })

        if (!response.ok) { 
            const errorData = await response.json()
            fillWarning(errorData.error, 0)
            return
        }

        const data = await response.json()
        await getAuth(true)

        // redirect to dashboard
        setWarningCookie(data.message, 1)
        window.location.href = "/dashboard"
    }catch(err){
        fillWarning(data.error, 0)
        console.error("Server error", err)
    }
}
