import { setWarningCookie, fillWarning, getAuth, getCookie } from "/assets/js/base.js"
import { logout } from "/assets/js/init.js"

const authStatus = await getAuth()

if(authStatus === "confirmed"){
    window.location.href = "/dashboard/"
}else if(!authStatus){
    window.location.href = '/auth/login/'
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

        const typedToken = document.querySelector("#iuserToken")
        if(typedToken){
            verifyToken(typedToken.value)
        }else{
            setWarningCookie("dberror", 0)
            window.location.href = "/auth/confirmToken/"
        }
    })
}

async function verifyToken(typedToken){
    try{
        const response = await fetch("/api/auth/confirmToken", {
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
        await getAuth(true) // refresh auth

        setWarningCookie(data.message, 1)
        window.location.href = "/dashboard/"
    }catch(err){
        fillWarning("dberror", 0)
        console.error("Server error: ", err)
    }
}


const removeAccBtn = document.querySelector(".warning-btn")
if(removeAccBtn){
    removeAccBtn.addEventListener("click", removeAccount)
}

async function removeAccount(){
    try{
        const response = await fetch("/api/me/remove", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include",
        })

        if(!response.ok){ 
            const errorData = await response.json()
            fillWarning(errorData.error, 0)
            return
        }

        // clear JWT cookie
        await logout()

        const data = await response.json()

        setWarningCookie(data.message, 1)
        window.location.href = "/auth/login/"
    }catch(err){
        fillWarning("dberror", 0)
        console.error("Server error: ", err)
    }
}