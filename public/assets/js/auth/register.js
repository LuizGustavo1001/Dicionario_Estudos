import { setWarningCookie, fillWarning, getAuth } from "../baseController.js"

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
    const mailValue     = document.querySelector("#iuserMail").value;

    register(usernameValue, mailValue, passwordValue)
})

async function register(username, email, password){
    const response = await fetch("/users/register", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({ 
            username: username,
            email:    email,
            password: password
        })
    })

    const data = await response.json()
    
    if(!response.ok){
        fillWarning(data.error, 0)
        return
    }

    // redirect to login + message
    setWarningCookie("userCreated", 1)
    window.location.href = "/auth/login/"
}
