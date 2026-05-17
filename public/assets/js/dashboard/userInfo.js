import { setWarningCookie, fillWarning, logout } from "../base.js"
import { renderIcon } from "../iconController.js"

// fetch functions
async function getUserInfo(){
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
    const userFolders = await getFolders()

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
    const folderTerms   = await getFolderTerms()

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

const folderList        = document.querySelector(".folders-list")
const termsArea         = document.querySelector(".terms-area")
const folderNameBox     = document.querySelector("#folder-name h1")

// fill user info
async function fillUsernameBox(){
    const user = await getUserInfo()

    const usernameBox = document.querySelector("#username")
    usernameBox.innerHTML = user.username
}

async function fillTermsArea(idFolder, nameFolder){
    if (!termsArea) return

    // clear terms at termsArea
    termsArea.innerHTML = ""

    try{
        const folderTerms = await getFolderTerms()

        if((idFolder === -1 || nameFolder === "") && folderTerms.length > 0){
            idFolder = folderTerms[0].idFolder
            nameFolder = folderTerms[0].nameFolder
        }

        // change selected folder
        const folders = folderList.querySelectorAll("li")
        folders.forEach(folder => {
            folder.classList.remove("selected")
            if(folder.dataset.id == idFolder){
                folder.classList.add("selected")
                folderNameBox.innerHTML = nameFolder
            }
        })

        const currentFolderTerms = folderTerms.filter(t => t.idFolder === idFolder)

        if(currentFolderTerms.length == 0){
            const errorMessage = document.createElement("div")
            errorMessage.classList.add("errorMessage")

            const emptyBoxIcon = document.createElement("i")
            emptyBoxIcon.dataset.icon = "emptyBox"
            emptyBoxIcon.classList.add("super-big-icon")

            errorMessage.append(emptyBoxIcon)

            errorMessage.innerHTML += "<span>Nenhum termo encontrado para a pasta selecionada<br>Adicione um termo para começar a utilizá-la</span>"

            termsArea.append(errorMessage)
        }else{
            const termMeanings = await getTermMeanings()

            currentFolderTerms.forEach(term => {
                const selectedTermMeanings = termMeanings.filter(m => m.idTerm === term.idTerm)

                // creating meaning element
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
    }catch(error){
        console.error("Failed to load folder terms: ", error)
        termsArea.innerHTML = "<p>Error loading data.</p>"
    }
}

fillUsernameBox()

async function fillFolderList(){
    // clear folders at folderlist
    folderList.innerHTML = ""

    const userFolders = await getFolders()

    userFolders.forEach(folder => {
        const item = document.createElement("li")
        item.setAttribute("style", `--color: ${folder.colorFolder}`)
        item.dataset.id = folder.idFolder
        item.addEventListener("click", () => { fillTermsArea(folder.idFolder, folder.nameFolder) })

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
    const firstFolder = userFolders[0]
    const firstFolderAttr = folderList.querySelectorAll("li")[0]
    firstFolderAttr.classList.add("selected")
    fillTermsArea(firstFolder.idFolder, firstFolder.nameFolder)
}

fillFolderList()

// verify last folder opened
