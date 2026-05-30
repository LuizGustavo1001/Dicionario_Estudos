import { setWarningCookie, fillWarning, logout, refreshIcons, downloadObject, downloadEvent } from "/assets/js/base.js"
import { renderIcon } from "/assets/js/iconController.js"
import { toggleDetailsEvent, openPopupEvent, closePopupEvent } from "/assets/js/dashboard/dashboardGeneral.js"
import { getFolderTerms, getFolders, getTermMeanings, getUserInfo } from "/assets/js/getData.js"

const folderList        = document.querySelector(".folders-list")
const termsArea         = document.querySelector(".terms-area")
const folderNameBox     = document.querySelector("#folder-name h1")
const editFolderIcon    = document.querySelector("#edit-folder-info")
const letterTermFilter  = document.querySelector(".letter-term-filter")


async function fillUserFields(){
    try{
        const user = await getUserInfo()
        if(!user) return

        const usernameInput = document.querySelector("#iusername")
        const usernameBox   = document.querySelector("#username")

        if(usernameBox) usernameBox.innerHTML = user.username
        if(usernameInput) usernameInput.value = user.username
    }catch(err){
        console.error("Failure trying to fill user fields: ", err)
        return null
    }
}

async function fillTermsArea(idFolder, nameFolder, letterFilter = "none"){
    if (!termsArea || !folderList) return

    // clear terms at termsArea
    termsArea.innerHTML = ""

    try{
        let folderTerms = await getFolderTerms()
        if(!folderTerms) return

        if((idFolder === -1 || nameFolder === "") && folderTerms.length > 0){
            idFolder = folderTerms[0].idFolder
            nameFolder = folderTerms[0].nameFolder
        }

        // change selected folder
        folderList.querySelectorAll("li").forEach(folder => {
            folder.classList.remove("selected")

            if(folder.dataset.id == idFolder){
                folder.classList.add("selected")
                folderNameBox.textContent = nameFolder
            }
        })

        if(letterFilter != "none"){
            folderTerms = folderTerms.filter(t => t.content[0] == letterFilter)
        }

        if(folderTerms.length == 0){
            const errorMessage = document.createElement("div")
            errorMessage.classList.add("errorMessage")

            const emptyBoxIcon = document.createElement("i")
            emptyBoxIcon.dataset.icon = "emptyBox"
            emptyBoxIcon.classList.add("super-big-icon")

            errorMessage.append(emptyBoxIcon)

            errorMessage.innerHTML += "<span>Nenhum termo encontrado com a letra selecionada</span>"

            termsArea.append(errorMessage)

            refreshIcons()
            toggleDetailsEvent() // add collapse event
            return
        }

        const currentFolderTerms = folderTerms.filter(t => t.idFolder == idFolder)

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
            if(!termMeanings) return

            currentFolderTerms.forEach(term => {
                const selectedTermMeanings = termMeanings.filter(m => m.idTerm === term.idTerm)

                const termBox = document.createElement("details")
                termBox.classList.add("term", "downloadable", "toggleEvent")
                termBox.dataset.id = term.idTerm

                const summary = document.createElement("summary")
                
                const termTitle = document.createElement("div")
                termTitle.classList.add("term-title")
  
                const termTitleText = document.createElement("p")
                termTitleText.textContent = term.content

                const btnNav = document.createElement("nav")
                btnNav.classList.add("btns-nav")
                /*
                const editIconBox = document.createElement("span")
                editIconBox.classList.add("icon-hold", "toggle-popup-icon")
                editIconBox.title = "Clique aqui para editar dados do termo"
                editIconBox.dataset.id = "edit-term"

                const editIcon = document.createElement("i")
                editIcon.dataset.icon = "edit"
                editIcon.dataset.id = term.idTerm

                const downloadIconBox = document.createElement("span")
                downloadIconBox.classList.add("icon-hold", "download-btn", "hidden-btn")
                downloadIconBox.title = "Clique aqui para fazer download do termo e seus significados"

                const downloadIcon = document.createElement("i")
                downloadIcon.dataset.icon = "download"

                const newTextIconBox = document.createElement("span")
                newTextIconBox.classList.add("icon-hold", "hidden-btn", "toggle-popup-icon")
                newTextIconBox.title = "Clique aqui para adicionar significado em texto"
                newTextIconBox.dataset.id = "add-meaning-text"

                const newTextIcon = document.createElement("i")
                newTextIcon.dataset.icon = "textboxplus"

                const newImageIconBox = document.createElement("span")
                newImageIconBox.classList.add("icon-hold", "hidden-btn", "toggle-popup-icon")
                newImageIconBox.title = "Clique aqui para adicionar significado em imagem"
                newImageIconBox.dataset.id = "add-meaning-image"

                const newImageIcon = document.createElement("i")
                newImageIcon.dataset.icon = "imageplus"

                newTextIconBox.append(newTextIcon)
                newImageIconBox.append(newImageIcon)
                editIconBox.append(editIcon)
                downloadIconBox.append(downloadIcon)
                */

                const menuBox = document.createElement("span")
                menuBox.classList.add("icon-hold", "hidden-btn", "open-menu-btn")
                menuBox.title = "Clique aqui para abrir as configurações do termo"
                menuBox.dataset.id = term.idTerm

                const menuBoxIcon = document.createElement("i")
                menuBoxIcon.dataset.icon = "ellipsis"

                menuBox.append(menuBoxIcon)

                termTitle.append(termTitleText)
                btnNav.append(menuBox)
                //btnNav.append(newTextIconBox, newImageIconBox, downloadIconBox, editIconBox)
                summary.append(termTitle, btnNav)

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
        }
        
        openPopupEvent()
        closePopupEvent()
        downloadEvent()
        refreshIcons()
        toggleDetailsEvent() // add collapse event
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
        if(!userFolders) return
        
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
        refreshIcons()

        // mark current folder as selected
        let selectedFolder = userFolders.find(f => f.idFolder == selectedFolderId)

        if(selectedFolderId === -1 || !selectedFolder){ // selected folder doesnt exists anymore -> try first from database
            selectedFolder = userFolders[0]
        }
        
        updateFormValues("edit-folder", selectedFolder)

        if(selectedFolderId !== null){
            editFolderIcon.dataset.folder = selectedFolder.idFolder
            fillTermsArea(selectedFolder.idFolder, selectedFolder.nameFolder)
        }
        letterFilterEvent()
    }catch(err){
        fillWarning("dberror", 0)
        console.error("Failure to load user folders: ", err)
    }
}

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

// startup function calls
fillUserFields()
fillFolderList(localStorage.getItem("lastFolder") || -1)

async function letterFilterEvent(){
    letterTermFilter.addEventListener("input", (e) => {
        const chosenLetter = e.target.value

        const selectedFolder = document.querySelector(".folders-list li.selected span")

        fillTermsArea(localStorage.getItem("lastFolder") || -1, selectedFolder.textContent, chosenLetter) 
    })
}
