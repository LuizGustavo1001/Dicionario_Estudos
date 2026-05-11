import { setWarningCookie, fillWarning, checkAuth } from "../baseController.js"

// verify session
async function init(){
    const data = await checkAuth()

    if(data?.authenticated){
        window.location.href = "/dashboard"
    }
}

init()

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

    const data = await response.json()
    
    if(!response.ok){
        fillWarning(data.error, 0)
        return
    }

    // redirect to dashboard
    setWarningCookie("loginSuccess", 1)
    window.location.href = "/dashboard"
}

