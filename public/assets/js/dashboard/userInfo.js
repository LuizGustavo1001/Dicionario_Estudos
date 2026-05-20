import { setWarningCookie, fillWarning, logout } from "../base.js"
import { renderIcon } from "../iconController.js"
import { toggleCollpsedEvent } from "./dashboardGeneral.js"

const folderList        = document.querySelector(".folders-list")
const termsArea         = document.querySelector(".terms-area")
const folderNameBox     = document.querySelector("#folder-name h1")
const editFolderIcon    = document.querySelector("#edit-folder-info")

async function getUserInfo(){
    try{
        const response = await fetch(`/users/me`, {
            method: "GET",
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include"
        })

        const data = await response.json()
        return data
    }catch(err){
        console.error("Failure trying to return user data: ", err)
        return null
    }
}

export async function getFolders(){
    try{
        const response = await fetch("/users/me/folders", {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-type": "application/json"
            }
        })

        const data = await response.json()
        return data
    }catch(err){
        console.error("Failure trying to fetch folders: ", err)
        return null
    }
}

async function getFolderTerms(){
    try{
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
        return data
    }catch(err){
        console.error("Failure to fetch folder terms: ", err)
        return null
    }
}

async function getTermMeanings(){
    try{
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
        return data
    }catch(err){
        console.error("Failure to fetch term meanings: ", err)
        return null
    }
}

async function fillUsernameBox(){
    try{
        const user = await getUserInfo()

        const usernameBox = document.querySelector("#username")
        usernameBox.innerHTML = user.username
    }catch(err){
        console.error("Failure to fill username: ", err)
        return null
    }
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
                const termBox = document.createElement("li")
                termBox.classList.add("term")
                termBox.dataset.id = term.idTerm

                const collapsible = document.createElement("button")
                collapsible.classList.add("collapsible")
                collapsible.ariaExpanded = false
                
                const termName = document.createElement("span")
                termName.classList.add("term-name")
                termName.textContent = term.content

                const editIconBox = document.createElement("span")
                editIconBox.classList.add("icon-hold")

                const editIcon = document.createElement("i")
                editIcon.dataset.icon = "edit"
                editIcon.dataset.id = term.idTerm

                editIconBox.append(editIcon)
                collapsible.append(termName, editIconBox)

                const content = document.createElement("div")
                content.classList.add("content")

                const contentInner = document.createElement("div")
                contentInner.classList.add("content-inner")

                selectedTermMeanings.forEach(meaning => {
                    if(meaning.type == "image"){
                        const image = document.createElement("img")
                        image.classList.add("meaning")
                        image.src = meaning.content
                        image.alt = `${term.content} image meaning`

                        contentInner.append(image)
                    }else{
                        const meaningText = document.createElement("p")
                        meaningText.classList.add("meaning")
                        meaningText.innerHTML = meaning.content

                        contentInner.append(meaningText)
                    }
                })

                content.append(contentInner)

                termBox.insertAdjacentElement("beforeend", collapsible)
                termBox.insertAdjacentElement("beforeend", content)

                termsArea.insertAdjacentElement("beforeend", termBox)
            })
        }

        // render icons
        document.querySelectorAll("[data-icon]").forEach(el => renderIcon(el))
        toggleCollpsedEvent()
    }catch(error){
        fillWarning("dberror", 0)
        console.error("Failure to load folder terms: ", error)
    }
}



export async function fillFolderList(selectedFolderId){
    // clear folders at folderlist
    folderList.innerHTML = ""

    try{
        const userFolders = await getFolders()

        if(!userFolders || userFolders.length === 0) return
        
        userFolders.forEach(folder => {
            const item = document.createElement("li")
            item.setAttribute("style", `--color: ${folder.colorFolder}`)
            item.dataset.id = folder.idFolder

            item.addEventListener("click", () => { 
                fillTermsArea(folder.idFolder, folder.nameFolder) 
                editFolderIcon.dataset.folder = folder.idFolder

                updateFormValues("edit-folder", folder)

                localStorage.setItem("lastFolder", folder.idFolder)

                folderList.querySelectorAll("li").forEach(li => li.classList.remove("selected"))
                item.classList.add("selected")
            })

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
        let selectedFolder = userFolders.find(f => f.idFolder == selectedFolderId)

        if(selectedFolderId === -1 || !selectedFolder){
            selectedFolder = userFolders[0]
        }

        updateFormValues("edit-folder", selectedFolder)

        if(selectedFolderId !== null){
            editFolderIcon.dataset.folder = selectedFolder.idFolder
            fillTermsArea(selectedFolder.idFolder, selectedFolder.nameFolder)
        }
    }catch(err){
        fillWarning("dberror", 0)
        console.error("Failure to load user folders: ", err)
    }
}

// startup function calls
fillUsernameBox()
fillFolderList(localStorage.getItem("lastFolder") || -1)


function updateFormValues(currentSection, data){
    const sectionForm = document.querySelector(`#${currentSection} form`)
    if (!sectionForm) {
        console.error(`Form not found in section: ${currentSection}`);
        return;
    }

    Object.entries(data).forEach(([key, value]) => {
        const field = sectionForm.querySelector(`[name="${key}"]`)
            
        if(field){
            field.value = value
        }
    })
}