import { getFolderTerms, getFolders, getTermMeanings, getUserInfo } from "/assets/js/getData.js"
import { fillWarning, refreshIcons } from "/assets/js/base.js"

const folderList        = document.querySelector(".folders-list")
const termsArea         = document.querySelector(".terms-area")
const folderNameBox     = document.querySelector("#folder-name h1")
const editFolderIcon    = document.querySelector("#edit-folder-info")
const letterTermFilter  = document.querySelector(".letter-term-filter select")

function refreshCurrentFolder(){
    const currentFolder = document.querySelector(".folders-list li.selected")

    if (!currentFolder) return null

    const currentFolderName = currentFolder.querySelector("span")

    return {
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
            expandIconBox.classList.add("icon-hold", "toggle-popup-icon")
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

letterFilterEvent()
renderUserInfo()
renderFolderList(null, localStorage.getItem("lastFolder") || -1)