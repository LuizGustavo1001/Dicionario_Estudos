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

        submitBtn.classList.add("waiting")

        const currentUsername   = document.querySelector("#ioldUsername")
        const newUsername       = document.querySelector("#inewUsername")
        const typedToken        = document.querySelector("#iuserToken")

        if((currentUsername && newUsername && typedToken) && currentUsername.value != newUsername.value){
            changeUsername(currentUsername.value.trim(), newUsername.value.trim(), typedToken.value.trim())
        }else if(currentUsername.value == newUsername.value){
            fillWarning("sameUsername", 0)
        }else{
            setWarningCookie("dberror", 0)
            window.location.href = "/auth/changeUsername/"
        }
    })
}

async function changeUsername(currentUsername, newUsername, typedToken){
    try{
        const response = await fetch("/api/me/username", {
            method: "PATCH",
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                currentUsername: currentUsername,
                newUsername: newUsername,
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