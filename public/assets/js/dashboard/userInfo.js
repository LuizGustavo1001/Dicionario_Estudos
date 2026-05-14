import { setWarningCookie, fillWarning, logout } from "../baseController.js"
import { renderIcon } from "../iconController.js"

// fetch functions
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

async function getFolders(){
    const response = await fetch("/users/me/folders", {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-type": "application/json"
        }
    })

    const data = await response.json()

    return (response.ok) ? data : null
}

async function getFolderTerms(){
    const folders = userFolders.map(f => f.idFolder)

    const response = await fetch("/users/me/folders/terms", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ 
            folders: folders
        })
    })

    const data = await response.json()

    return (response.ok) ? data : null
}

async function getTermMeanings(){
    const terms = folderTerms.map(t => t.idTerm)

    const response = await fetch("/users/me/folders/terms/meanings", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            terms: terms
        })
    })

    const data = await response.json()

    return (response.ok) ? data : null
}

const userInfo      = await getUserInfo()
const userFolders   = await getFolders()
const folderTerms   = await getFolderTerms()
const termMeanings  = await getTermMeanings()

// verificar se tudo chegou => caso contrário, warning message


const folderList    = document.querySelector(".folders-list")
const termsArea     = document.querySelector(".terms-area")

// fill user info
const usernameBox = document.querySelector("#username")
usernameBox.innerHTML = userInfo.username

function fillTermsArea(idFolder){
    // clear terms at termsArea
    termsArea.innerHTML = ""

    // change selected folder
    const folders = folderList.querySelectorAll("li")
    folders.forEach(folder => {
        folder.classList.remove("selected")
        if(folder.dataset.id == idFolder){
            folder.classList.add("selected")
        }
    })

    const selectedFolderTerms = folderTerms.filter(t => t.idFolder === idFolder)

    if(selectedFolderTerms.length == 0){
        const errorMessage = document.createElement("div")
        errorMessage.classList.add("errorMessage")

        const emptyBoxIcon = document.createElement("i")
        emptyBoxIcon.dataset.icon = "emptyBox"
        emptyBoxIcon.classList.add("super-big-icon")

        errorMessage.append(emptyBoxIcon)

        errorMessage.innerHTML += "<span>Nenhum termo encontrado para a pasta selecionada<br>Adicione um termo para começar a utilizá-la</span>"

        termsArea.append(errorMessage)
    }else{
        selectedFolderTerms.forEach(term => {
            const selectedTermMeanings = termMeanings.filter(m => m.idTerm === term.idTerm)

            const details = document.createElement("details")
            details.classList.add("term", "item", "term-name")
            details.dataset.id = term.idTerm

            const summary = document.createElement("summary")

            const termTitle = document.createElement("span")
            termTitle.classList.add("term-title")

            const arrowIcon = document.createElement("i")
            arrowIcon.dataset.icon = "chevronRight"

            const termTitleText = document.createElement("span")
            termTitleText.classList.add("text")
            termTitleText.innerHTML = term.content

            const editIconBox = document.createElement("span")
            editIconBox.setAttribute("title", "Clique aqui para editar informações do termo")

            const editIcon = document.createElement("i")
            editIcon.dataset.icon = "edit"
            editIcon.dataset.id = term.idTerm

            const meaningsBox = document.createElement("ul")
            meaningsBox.classList.add("meanings")

            selectedTermMeanings.forEach(meaning => {
                const itemBox = document.createElement("li")

                if(meaning.type == "image"){
                    const image = document.createElement("img")
                    image.src = meaning.content
                    image.alt = `${term.content} image meaning`

                    itemBox.append(image)
                }else{
                    itemBox.innerHTML = meaning.content
                }
                
                meaningsBox.append(itemBox)
            })

            editIconBox.append(editIcon)
            termTitle.append(arrowIcon, termTitleText)
            summary.append(termTitle, editIconBox)

            details.insertAdjacentElement("beforeend", summary)
            details.insertAdjacentElement("beforeend", meaningsBox)

            termsArea.insertAdjacentElement("beforeend", details)
        })
    }

    // render icons
    document.querySelectorAll("[data-icon]").forEach(el => renderIcon(el))
}

fillTermsArea(1)

function fillFolderList(){
    // clear folders at folderlist
    folderList.innerHTML = ""

    userFolders.forEach(folder => {
        const item = document.createElement("li")
        item.setAttribute("style", `--color: ${folder.colorFolder}`)
        item.dataset.id = folder.idFolder
        item.addEventListener("click", () => { fillTermsArea(folder.idFolder) })

        const highlightBar = document.createElement("div")
        highlightBar.classList.add("highlight-clr-bar")

        const folderSVG = document.createElement("i")
        folderSVG.dataset.icon = "folder"

        const folderName = document.createElement("span")
        folderName.innerHTML = folder.nameFolder

        item.append(highlightBar, folderSVG, folderName)

        folderList.insertAdjacentElement("beforeend", item)
    })

    // render icons
    document.querySelectorAll("[data-icon]").forEach(el => renderIcon(el))

    // select first folder at folderList
    const firstFolder = folderList.querySelectorAll("li")[0]
    firstFolder.classList.add("selected")
}

fillFolderList()