import { setWarningCookie, fillWarning, logout } from "../baseController.js"

// Get user info
async function getUserInfo(id){
    const response = await fetch(`/users/me`, {
        method: "GET",
        headers: {
            "Content-type": "application/json"
        },
        credentials: "include"
    })

    const data = await response.json()

    return (response.ok) ? data : null
}

async function loadUser(){
    const user = await getUserInfo()

    return user || null
}

const userInfo = await loadUser()

// fill user info
const usernameBox = document.querySelector("#username")
usernameBox.innerHTML = userInfo.username

