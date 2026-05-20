import { setWarningCookie, fillWarning, getAuth } from "../base.js"

// verify session
const auth = await getAuth()

if(auth){
    window.location.href = "/dashboard"
}


const form = document.querySelector("form")
const submitBtn = document.querySelector(".btn.submit")

form.addEventListener("submit", (e) => {
    e.preventDefault()

    if(! form.checkValidity()){
        fillWarning("formNotFilled", 0)
        return
    }

    const usernameValue = document.querySelector("#iuserName").value
    const passwordValue = document.querySelector("#ipassword").value

    login(usernameValue, passwordValue)
})

async function login(username, password){
    try{
        const response = await fetch("/users/login", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include", // accept cookies
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

        // redirect to dashboard
        setWarningCookie(data.message, 1)
        window.location.href = "/dashboard"
    }catch(err){
        fillWarning(data.error, 0)
        console.error("Server error", err)
    }
}

