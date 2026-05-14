import { renderIcon } from "./iconController.js"

// render icons
document.querySelectorAll("[data-icon]").forEach(el => renderIcon(el))

export function setWarningCookie(value, type){
    const d = new Date()

    d.setTime(d.getTime() + 60000)

    let expires = `expires=${d.toUTCString()}`
    document.cookie = `warning_message=${value};${expires};path=/` // message cookie
    document.cookie = `warning_type=${type};${expires};path=/` // message type cookie
}

export function getCookie(name){
    const cookies = document.cookie.split("; ")

    for(let cookie of cookies){
        const [key, value] = cookie.split("=")

        if( key === name){
            return decodeURIComponent(value)
        }
    }
    return null
}

const cookie_message = getCookie("warning_message")
const cookie_type = getCookie("warning_type")
if(cookie_message && cookie_type){
    fillWarning(cookie_message, Number(cookie_type))
}

export function fillWarning(message, type){
    let warningClass = (type == 0) ? "error" : "success"

    const messages_map = {
        formNotFilled   : "Formulário precisa ser preenchido para avançar",
        userExists      : "Nome de usuário já encontra-se cadastrado no sistema",
        emailExists     : "E-mail digitado já encontra-se cadastrado no sistema",
        userCreated     : "Registro efetuado. Faça seu login para ter acesso ao seu dicionário",
        userNotExists   : "Nome de usuário digitado não existe no sistema. Tente novamente",
        invalidPassword : "Senha digitado está incorreta. Tente novamente",
        loginSuccess    : "Login efeutado com sucesso",
        logoutSuccess   : "Logout efetuado com sucesso",
        dberror         : "Erro interno. Tente novamente ou contate o suporte",
        dev             : "Função ainda em desenvolvimento ou manutenção. Tente novamente mais tarde"
    }

    if(messages_map[message]){
        const warningBox = document.createElement("div")
        warningBox.classList.add("warning-item", "fade-in-up", warningClass)

        warningBox.innerHTML = `<strong>${messages_map[message]}</strong>. <em>Clique aqui para fechar esta mensagem.</em>`

        const messagesBox = document.querySelector(".messages-box")

        messagesBox.insertAdjacentElement("beforeend", warningBox)

        // remove message when click or after 10 sec
        const removeBox = () => {
            warningBox.classList.add("fade-out")
            setTimeout(() => warningBox.remove(), 500)
        }

        warningBox.addEventListener("click", removeBox)

        setTimeout(removeBox, 10000)

        // clear warning cookies
        document.cookie = "warning_message=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "warning_type=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
}


// verify user session
let authPromise = null

export function getAuth(){
    if(!authPromise){
        authPromise = checkAuth()
    }
    return authPromise
}

async function checkAuth(){
    const response = await fetch("/users/auth", {
        credentials: "include"
    })

    if(! response.ok){
        return null
    }

    const data = await response.json()
    
    return (data?.authenticated) ? true : false
}

// logout
export async function logout(){
    const response = await fetch("/users/logout", {
        credentials: "include"
    })

    if(! response.ok){
        return null
    }

    return await response.json()
}



// details tag event
function detailsEvent(){
    const details = document.querySelectorAll("details.term")

    details.forEach(tag => {
        tag.addEventListener("click", (e) => {
            e.preventDefault()
            
            if(tag.getAttribute("open")){
                tag.removeAttribute("open")
                tag.classList.remove("fade-in-up")
            }else{
                tag.setAttribute("open", true)
                tag.classList.add("fade-in-up")
            }

  
            
        })
    })

}

detailsEvent()