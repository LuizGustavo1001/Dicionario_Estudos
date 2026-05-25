import { setWarningCookie, fillWarning, logout, refreshIcons } from "/assets/js/base.js"
import { renderIcon } from "/assets/js/iconController.js"
import { toggleCollpsedEvent } from "/assets/js/dashboard/dashboardGeneral.js"
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
            toggleCollpsedEvent() // add collapse event
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
       
        refreshIcons()
        toggleCollpsedEvent() // add collapse event
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
