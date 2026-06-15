import { renderIcon } from "/assets/js/iconController.js"

const cookie_message    = getCookie("warning_message")
const cookie_type       = getCookie("warning_type")

let authPromise = null

export function refreshIcons(){ // render icons
    const dataIcons = document.querySelectorAll("[data-icon]")

    if(dataIcons.length > 0){
        dataIcons.forEach(el => renderIcon(el))
    }
}

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

export function fillWarning(message, type){
    let warningClass = (type == 0) ? "error" : "success"

    const messages_map = {
        formNotFilled   : "Formulário precisa ser preenchido para avançar",
        userExists      : "Nome de usuário já encontra-se cadastrado no sistema",
        userCreated     : "Registro efetuado. Faça seu login para ter acesso ao seu dicionário",
        userNotFound    : "Nome de usuário digitado não existe no sistema. Tente novamente",
        invalidPassword : "Senha digitado está incorreta. Tente novamente",
        loginSuccess    : "Login efeutado com sucesso",
        logoutSuccess   : "Logout efetuado com sucesso",
        folderCreated   : "Pasta criada com sucesso",
        folderExists    : "Nome de pasta digitado já cadastrado. Tente novamente",
        emptyFolderName : "Nome de pasta está vazio. Tente novamente",
        sameFolderName  : "Nome de pasta digitado está igual ao anterior. Tente novamente",
        folderModified  : "Informações da pasta selecionada alteradas com sucesso",
        termCreated     : "Termo criado com sucesso",
        folderNotSelected: "Nenhuma pasta está selecionada. Tente novamente",
        folderDeleted   : "Pasta removida com sucesso",
        tokenVerified   : "Token de autenticação verificado com sucesso",
        incorrectToken  : "Token inserido está incorreto. Tente novamente",
        tokenNotFound   : "Token inserido não encontrado. Tente novamente",
        usernameChanged : "Nome de usuário alterado com sucesso",
        sameUsername    : "Nome de usuário digitado está igual ao atual. Tente novamente",
        passwordChanged : "Senha alterada com sucesso. Faça seu login novamente",
        tokenCreated    : "Novo código de verificação criado com sucesso",
        accountRemoved  : "Conta removida com sucesso",
        fieldUpdated    : "Campo alterado com sucesso",
        meaningNotFound : "Significado não encontrado",
        MeaningCreated  : "Significado adicionado com sucesso",
        missingFields   : "Campos requeridos do formulário não preenchidos ainda. Tente novamente",
        serverError     : "Erro interno do servidor. Tente novamente ou contate o suporte",
        meaningDeleted  : "Significado removido com sucesso",
        dberror         : "Erro interno. Tente novamente ou contate o suporte",
        dev             : "Função ainda em desenvolvimento ou manutenção. Tente novamente mais tarde"
    }

    if(messages_map[message]){
        const messagesBox = document.querySelector(".snackbars-box")
        if(!messagesBox) return

        // snackbar elements
        const snackbarItem = document.createElement("div")
        snackbarItem.classList.add("snackbar", "fade-in-up", warningClass)

        const verticalLine = document.createElement("span")
        verticalLine.classList.add("vertical-line")

        const snackbarText = document.createElement("span")
        snackbarText.classList.add("snackbar-text")
        snackbarText.textContent = `${messages_map[message]}.`

        snackbarItem.append(verticalLine, snackbarText)
        messagesBox.insertAdjacentElement("beforeend", snackbarItem)

        // remove message logic
        const removeBox = () => {
            snackbarItem.classList.add("fade-out")
            setTimeout(() => snackbarItem.remove(), 500)
        }

        snackbarItem.addEventListener("click", removeBox)

        setTimeout(removeBox, 10000)

        // clear warning cookies
        document.cookie = "warning_message=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        document.cookie = "warning_type=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    }else{
        console.log("message id NOT registered: ", message)
    }
}

// verify user session
export function getAuth(forceRefresh = false){
    if(forceRefresh){
        authPromise = null
    }

    if(!authPromise){
        authPromise = checkAuth()
    }
    return authPromise
}

async function checkAuth(){
    try{
        const response = await fetch("/api/me/auth", {
            method: "GET",
            credentials: "include"
        })

        if(!response.ok){
            if(response.status >= 500){
                console.error("Failure trying to check user auth: ", response.status)
            }
            return false
        }

        const data = await response.json()

        if(data?.authenticated){
            return data.status
        }

        return false
    }catch(err){
        console.error("Failure trying to check user auth: ", err)
        return false
    }
}

// retrieve message cookies
if(cookie_message && cookie_type){
    fillWarning(cookie_message, Number(cookie_type))
}

refreshIcons()