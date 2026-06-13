import { getFolderTerms, getFolders, getTermMeanings, getUserInfo } from "/assets/js/getData.js"
import { fillWarning, refreshIcons } from "/assets/js/base.js"

const folderList        = document.querySelector(".folders-list")
const termsArea         = document.querySelector(".terms-area")
const folderNameBox     = document.querySelector("#folder-name h1")
const editFolderIcon    = document.querySelector("#edit-folder-info")
const letterTermFilter  = document.querySelector(".letter-term-filter select")

function refreshCurrentFolder(){
    const currentFolder = document.querySelector(".folders-list li.selected")

    if(!currentFolder) return null

    const currentFolderName = currentFolder.querySelector("span")

    return{
        idFolder: currentFolder.dataset.id,
        nameFolder: currentFolderName ? currentFolderName.textContent : ""
    }
}

export async function renderUserInfo(){
    try{
        const user = await getUserInfo()
        if(!user) return

        const usernameInput = document.querySelector("#iusername")
        const usernameBox   = document.querySelector("#username")

        if(usernameBox) usernameBox.innerHTML = user.username
        if(usernameInput) usernameInput.value = user.username
    }catch(err){
        console.error("Failure trying to render user fields: ", err)
        return null
    }
}

export async function renderFolderList(foldersMap = null, currentIdFolder){
    if (!folderList) return

    folderList.textContent = "" // ensure it's clean

    try{
        if(!foldersMap){
            foldersMap = await getFolders()
        }

        if(foldersMap.length == 0){
            renderEmptyFoldersState()
            return
        }

        foldersMap.forEach(folder => {
            const item = document.createElement("li")
            item.setAttribute("style", `--color: ${folder.colorFolder}`)
            item.dataset.id = folder.idFolder
            
            const highlightBar = document.createElement("div")
            highlightBar.classList.add("highlight-clr-bar")

            const folderIcon = document.createElement("i")
            folderIcon.dataset.icon = "folder_fill"

            const folderName = document.createElement("span")
            folderName.textContent = folder.nameFolder

            item.append(highlightBar, folderIcon, folderName)

            folderList.insertAdjacentElement("beforeend", item)

            folderEventInit(item, folder)
        })

        // determine which folder should be marked active/selected
        let selectedFolder = foldersMap.find(f => f.idFolder == currentIdFolder)

        if(currentIdFolder === -1 || !selectedFolder){
            selectedFolder = foldersMap[0]
        }

        // find the matching DOM list item and mark as selected
        const targetListItem = folderList.querySelector(`li[data-id="${selectedFolder.idFolder}"]`)
        if (targetListItem) {
            targetListItem.classList.add("selected")
        }

        // render folder title
        const folderTitle = document.querySelector(".hero .header-text h1")
        folderTitle.textContent = selectedFolder.nameFolder

        const termsMap = await mapFolderTerms(selectedFolder.idFolder)

        // UI updates
        refreshIcons()
        updateFormValues("edit-folder", selectedFolder)
        renderTermsArea(termsMap)

        if(editFolderIcon){
            editFolderIcon.dataset.folder = selectedFolder.idFolder
        }
    }catch(err){
        fillWarning("dberror", 0)
        console.error("Failure to load user folders: ", err)
    }
}

export async function mapFolders(filter = null){
    try{
        const userFolders = await getFolders()
        if(!userFolders || userFolders.length === 0) {
            renderEmptyFoldersState()
            return
        }

        if(filter){
            const searchTerm = filter.toLowerCase()
            const currentFolders = userFolders.filter(f => f.nameFolder?.toLowerCase().includes(searchTerm))
            return currentFolders
        }

        return userFolders
    }catch(err){
        fillWarning("dberror", 0)
        console.error("Failure to load user folders: ", err)
    }
}

const searchFolder = document.querySelector("#search-folder")
if(searchFolder){
    searchFolder.addEventListener("input", async (e) => {
        const searchTerm = e.target.value

        const foldersMap = await mapFolders(searchTerm)

        renderFolderList(foldersMap, localStorage.getItem("lastFolder") || -1)
    })
}

const searchFilter = document.querySelector("#term-search")
searchFilter.addEventListener("input", async (e) => {
    const selectedFolder = refreshCurrentFolder()
    if(!selectedFolder) return

    const value = selectedFolder.idFolder

    const searchTerm = e.target.value

    const termsMap = await mapFolderTerms(value, "search", searchTerm)
    renderTermsArea(termsMap)
})

export async function mapFolderTerms(idFolder, type = null, filter = null){
    try{
        const foldersList = await getFolderTerms()
        if(!foldersList) return []

        let currentFolderTerms = foldersList.filter(t => t.idFolder == idFolder) // terms from selected folder

        if(type == "search"){
            if(filter && typeof filter === "string"){ // check if filter exists
                const searchTerm = filter.toLowerCase()

                currentFolderTerms = currentFolderTerms.filter(t => t.content?.toLowerCase().includes(searchTerm))
            }
        }

        if(type == "select"){
            if(filter){
                currentFolderTerms = currentFolderTerms.filter(t => t.content[0] == filter)
            }
        }
        
        return currentFolderTerms
    }catch(err){
        fillWarning("dberror", 0)
        console.error("Failure trying to map folder terms: ", err)
        return []
    }
}

export async function renderTermsArea(termsMap = null){
    if (!termsArea || !folderList) return

    termsArea.textContent = "" // Ensure it's clear
    const selectedFolder = refreshCurrentFolder()

    try{
        if(!selectedFolder){
            renderEmptyState("Nenhuma pasta selecionada")
            return
        }

        if(!termsMap){ // no filter selected (website initialized)
            termsMap = await mapFolderTerms(selectedFolder.idFolder)
        }

        if(!termsMap || termsMap.length == 0){
            renderEmptyState("Nenhum termo encontrado com o filtro ou pasta selecionada")
            return
        }

        const termMeanings = await getTermMeanings()
        if(!termMeanings) return

        termsMap.forEach(term => {
            const selectedTermMeanings = termMeanings.filter(m => m.idTerm === term.idTerm)

            const termBox = document.createElement("details")
            termBox.classList.add("term", "downloadable", "toggle-event")
            termBox.dataset.id = term.idTerm

            const summary = document.createElement("summary")
            
            const termTitle = document.createElement("div")
            termTitle.classList.add("term-title")

            const termTitleText = document.createElement("p")
            termTitleText.textContent = term.content

            termTitle.append(termTitleText)

            const expandIconBox = document.createElement("span")
            expandIconBox.classList.add("icon-hold", "toggle-popup-icon", "expand-term")
            expandIconBox.dataset.id = "term-expand"
            const expandIcon = document.createElement("i")
            expandIcon.dataset.icon = "expand"

            expandIconBox.append(expandIcon)
            summary.append(termTitle, expandIconBox)

            const meaningsBox = document.createElement("div")
            meaningsBox.classList.add("meanings", "content")
            meaningsBox.dataset.id = term.idTerm
            
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

            meaningsBox.append(contentInner)

            termBox.insertAdjacentElement("beforeend", summary)
            termBox.insertAdjacentElement("beforeend", meaningsBox)

            termsArea.insertAdjacentElement("beforeend", termBox)
        })

        // UI updates
        refreshIcons()
    }catch(err){
        fillWarning("dberror", 0)
        console.error("Failure trying to render terms area: ", err)
    }
}

function renderEmptyState(message){
    termsArea.textContent = "" // Ensure it's clear
    const errorMessage = document.createElement("div")
    errorMessage.classList.add("errorMessage")

    const emptyBoxIcon = document.createElement("i")
    emptyBoxIcon.dataset.icon = "emptyBox"
    emptyBoxIcon.classList.add("super-big-icon")

    errorMessage.append(emptyBoxIcon)
    errorMessage.innerHTML += `<span>${message}</span>`
    termsArea.append(errorMessage)

    refreshIcons()
}

export function folderEventInit(folderElement, folderData){
    folderElement.addEventListener("click", async () => {
        const termsMap = await mapFolderTerms(folderElement.dataset.id)

        const folderTitle = document.querySelector(".hero .header-text h1")
        folderTitle.textContent = folderData.nameFolder

        renderTermsArea(termsMap)
        
        updateFormValues("edit-folder", folderData) 

        editFolderIcon.dataset.folder = folderElement.dataset.id
        localStorage.setItem("lastFolder", folderElement.dataset.id)

        folderList.querySelectorAll("li").forEach(li => li.classList.remove("selected"))
        folderElement.classList.add("selected")
       
        if(letterTermFilter){ letterTermFilter.selectedIndex = 0 }
    })
}

function updateFormValues(currentSection, data){
    const sectionForm = document.querySelector(`#${currentSection} form`)
    if (!sectionForm) {
        console.error(`Form not found in section: ${currentSection}`)
        return
    }

    Object.entries(data).forEach(([key, value]) => {
        const field = sectionForm.querySelector(`[name="${key}"]`)
            
        if(field){
            field.value = value
        }
    })
}

function letterFilterEvent(){
    if (!letterTermFilter) return

    letterTermFilter.addEventListener("input", async (e) => {
        const chosenLetter = e.target.value

        const selectedFolderLi = document.querySelector(".folders-list li.selected")
        if (!selectedFolderLi) return

        const idFolder = selectedFolderLi.dataset.id

        if(chosenLetter != "none"){
            const termsMap = await mapFolderTerms(idFolder, "select", chosenLetter)
            await renderTermsArea(termsMap)
        }else{
            const termsMap = await mapFolderTerms(idFolder)
            await renderTermsArea(termsMap)
        }
    })
}

export function renderEmptyFoldersState(){ // test
    if (!folderList) return
    folderList.textContent = "" // ensure it's clean
    
    const emptyMessage = document.createElement("li")
    emptyMessage.textContent = "Nenhuma pasta encontrada"
    emptyMessage.classList.add("empty-message")
    
    folderList.append(emptyMessage)
    
    renderEmptyState("Nenhuma pasta selecionada")
}

const termExpandBox = document.querySelector("#term-expand")

export async function renderExpandedTerm(idTerm){
    if(!termExpandBox) return
    termExpandBox.textContent = "" // ensure it's clean

    try{
        const response = await fetch(`/api/me/terms/${idTerm}`, {
            method: "GET",
            credentials: "include"
        })

        const result = await response.json()
        
        if(!response.ok){
            fillWarning(result.error, 0)
            return
        }

        // render term content
        const nav = document.createElement("nav")
        nav.dataset.term = result[0].idTerm

        const dropdown = document.createElement("div")
        dropdown.classList.add("dropdown")

        const ellipsisIconBox = document.createElement("button")
        ellipsisIconBox.classList.add("icon-hold", "secondary", "dropdown-hover")
        const ellipsisIcon = document.createElement("i")
        ellipsisIcon.dataset.icon = "ellipsis"

        ellipsisIconBox.append(ellipsisIcon)

        const dropdownContent = document.createElement("ul")
        dropdownContent.classList.add("dropdown-content")

        const downloadIconBox = document.createElement("li")
        downloadIconBox.classList.add("download-btn")
        downloadIconBox.dataset.element = "#term-expand .downloadable"
        const downloadIcon = document.createElement("i")
        downloadIcon.dataset.icon = "download"
        const downloadText = document.createElement("span")
        downloadText.textContent = "Baixar Termo"
        downloadIconBox.append(downloadIcon, downloadText)

        const addTextIconBox = document.createElement("li")
        addTextIconBox.classList.add("toggle-popup-icon")
        addTextIconBox.dataset.id = "add-meaning-text"
        const addTextIcon = document.createElement("i")
        addTextIcon.dataset.icon = "textboxplus"
        const addTextContent = document.createElement("span")
        addTextContent.textContent = "Adicionar Significado por Texto"
        addTextIconBox.append(addTextIcon, addTextContent)

        const addImageIconBox = document.createElement("li")
        addImageIconBox.classList.add("toggle-popup-icon")
        addImageIconBox.dataset.id = "add-meaning-image"
        const addImageIcon = document.createElement("i")
        addImageIcon.dataset.icon = "imageplus"
        const addImageText = document.createElement("span")
        addImageText.textContent = "Adicionar Significado por Imagem"
        addImageIconBox.append(addImageIcon, addImageText)

        const closeBox = document.createElement("button")
        closeBox.classList.add("icon-hold", "secondary", "close-popup-icon")
        const closeIcon = document.createElement("i")
        closeIcon.dataset.icon = "closeX"
        closeBox.append(closeIcon)

        dropdownContent.append(downloadIconBox, addTextIconBox, addImageIconBox)
        dropdown.append(ellipsisIconBox, dropdownContent)
        nav.append(dropdown, closeBox)

        const content = document.createElement("div")
        content.classList.add("content", "downloadable")

        const termNameBox = document.createElement("div")
        termNameBox.classList.add("term-name")
        const termName = document.createElement("input")
        termName.type = "text"
        termName.name = "modifyTermName"
        termName.id = "imodifyTermName"
        termName.classList.add("just-input", "secondary")
        termName.value = result[0].termName
        termNameBox.append(termName)

        const contentMeanings = document.createElement("div")
        contentMeanings.classList.add("meanings")

        let counter = 0
        result.forEach(el => {
            if(el.type == "text"){
                const meaning = document.createElement("textarea")
                meaning.classList.add("just-input")
                meaning.rows = 3
                meaning.dataset.meaning = el.idMeaning
                meaning.maxLength = 300
                meaning.name = `meaning#${counter}`
                meaning.id = `meaning#${counter}`
                meaning.innerHTML = el.meaningContent
                contentMeanings.append(meaning)
            }else{
                const meaning = document.createElement("img")
                meaning.dataset.meaning = el.idMeaning
                meaning.classList.add("meaning")
                meaning.src = el.meaningContent
                meaning.alt = `${el.termName} image meaning`
                contentMeanings.append(meaning)
            }
            counter++
        })
        content.append(termNameBox, contentMeanings)

        termExpandBox.append(nav, content)

        // add selected term id
        const addTextMeaningPopup = document.querySelector("#add-meaning-text")
        const addImageMeaningPopup = document.querySelector("#add-meaning-image")

        if(!addTextMeaningPopup || !addImageMeaningPopup) return

        addTextMeaningPopup.dataset.term = result[0].idTerm
        addImageMeaningPopup.dataset.term = result[0].idTerm

        setupAutoSaveEvents(idTerm, termExpandBox)
        refreshIcons()
    }catch(err){
        console.error("Server error", err)
    }
}

function setupAutoSaveEvents(idTerm, container){
    // try to update term name
    const inputTermName = container.querySelector("#imodifyTermName")

    if(inputTermName){
        let currentValue = inputTermName.value.trim()

        inputTermName.addEventListener("blur", async (e) => {
            const newValue = e.target.value.trim()

            if(!newValue || newValue === currentValue){
                if(!newValue) e.target.value = currentValue // avoid blank term name
                return
            }
            
            const success = await sendUpdate("PATCH",`/api/me/terms/${idTerm}/name`, { termName: newValue })
            
            if(success){
                renderFolderList(null, localStorage.getItem("lastFolder") || -1)
                currentValue = newValue
            }
        })
    }

    // try to update meanings
    const textareas = container.querySelectorAll(".meanings textarea")
    
    textareas.forEach(textarea => {
        let currentValue = textarea.value.trim()

        textarea.addEventListener("blur", async (e) => {
            const newValue  = e.target.value.trim()
            const idMeaning = e.target.dataset.meaning

            if(newValue === currentValue) return

            // delete meaning (empty value)
            if(newValue === ""){
                const success = await sendUpdate("DELETE", `/api/me/terms/meanings/text/${idMeaning}`, null)

                if (success) {
                    renderFolderList(null, localStorage.getItem("lastFolder") || -1)
                    textarea.remove()
                }
                return
            }

            // update value
            const success = await sendUpdate("PATCH", `/api/me/terms/meanings/text/${idMeaning}`, { meaningContent: newValue })

            if(success){
                renderFolderList(null, localStorage.getItem("lastFolder") || -1)
                currentValue = newValue
            }
        })
    })
}

async function sendUpdate(method, url, data){
    try{
        let fetchOptions = {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
        }
        

        if(data){ fetchOptions.body = JSON.stringify(data) }

        const response = await fetch(url, fetchOptions)

        if(!response.ok){
            const result = await response.json()
            fillWarning("dberror", 0)
            return false
        }

        fillWarning("fieldUpdated", 1)
        return true
    }catch(err){
        console.error("Server error", err)
        return false
    }
}

letterFilterEvent()
renderUserInfo()
renderFolderList(null, localStorage.getItem("lastFolder") || -1)