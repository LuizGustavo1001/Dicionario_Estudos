import { setWarningCookie, fillWarning } from "/assets/js/base.js"
import { renderFolderList } from "/assets/js/dashboard/renderContents.js"
import { closePopup } from "/assets/js/init.js"

document.addEventListener("click", async (e) => {
    const closestBtn = e.target.closest("[data-id='rmv-image'], .btn.submit-popup-form, .btn.warning-btn")

    if(!closestBtn) return

    e.preventDefault()
    e.stopPropagation()

    const routeLabel = closestBtn.dataset.id || null

    if(routeLabel){
        const popupSection  = document.querySelector(`#${routeLabel}`)
        const closestForm   = closestBtn.closest("form")

        if(routeLabel === "add-folder"){
            mapAddFolder(closestBtn, popupSection)
        }else if(routeLabel === "add-term"){
            mapAddTerm(closestBtn, popupSection)
        }else if(routeLabel === "edit-folder"){
            mapEditFolder(closestBtn, popupSection)
        }else if(routeLabel === "rmv-folder"){
            mapRemoveFolder(closestBtn)
        }else if(routeLabel === "add-meaning-text"){
            mapAddTextMeaning(closestBtn, popupSection, closestForm)
        }else if(routeLabel === "add-meaning-image"){
            mapAddImageMeaning(closestBtn, popupSection, closestForm)
        }else if(routeLabel === "rmv-image"){
            mapRemoveImage(closestBtn)
        }else{
            closestBtn.classList.remove("waiting")
            console.error('System error')
        }

        closestBtn.classList.remove("waiting")

        if(closestForm && routeLabel !== "rmv-image"){ 
            closestForm.reset()
        }
    }
    
})

async function mapAddFolder(clickedBtn, popup){
    const nameFolder    = popup.querySelector("#ifolder")
    const clr           = popup.querySelector("#iclr")

    if(!nameFolder || !clr){
        fillWarning("missingFields", 0)
        return
    }

    addFolder(nameFolder.value.trim(), clr.value)
}

async function mapAddTerm(clickedBtn, popup){
    const selectedFolder = document.querySelector(".folders-list li.selected")
    if(!selectedFolder){
        fillWarning("folderNotSelected", 0)
        return
    }
    
    const folderId      = selectedFolder.dataset.id
    const newTermName   = popup.querySelector("#iNewTerm").value.trim() || null
    const meanings      = popup.querySelectorAll(".term-input, .image-input")

    const formData = new FormData()
    formData.append("idFolder", folderId)
    formData.append("termName", newTermName)

    let hasValidMeaning = false
    let meaningsMap = [] // temp array to store all meanings

    meanings.forEach((meaning) => {
        const isTextValid = meaning.name !== "image" && meaning.value.trim() !== ""
        const isFileValid = meaning.name === "image" && meaning.type === "file" && meaning.files.length > 0

        if(isTextValid || isFileValid){
            hasValidMeaning = true

            if(meaning.name == "image"){
                const file = meaning.files[0] // to use muler

                meaningsMap.push({
                    type: "image",
                    content: file.name
                })
                
                formData.append("images", file)
            }else{
                meaningsMap.push({
                    type: "text",
                    content: meaning.value.trim()
                })
            }
        }
    })

    if(!newTermName || !hasValidMeaning){
        fillWarning("missingFields", 0)
        return
    }

    formData.append("meanings", JSON.stringify(meaningsMap))
    addTerm(folderId, formData)
}

async function mapEditFolder(clickedBtn, popup){
    // retrieve selected folder data
    const currentIdFolder = document.querySelector("#edit-folder-info").dataset.folder || null
    if(!currentIdFolder){
        fillWarning("noSelectedFolder", 0)
        return
    }

    const newNameFolder    = popup.querySelector("#inameFolder").value.trim() || null
    const newClr           = popup.querySelector("#inewClr").value || null

    if(newNameFolder && newClr){
        editFolderData(currentIdFolder, newNameFolder, newClr)
    }
}

async function mapRemoveFolder(clickedBtn){
    const selectedFolder = document.querySelector(".folders-list li.selected")

    if(!selectedFolder){
        fillWarning("noSelectedFolder", 0)
        return
    }

    const selectedFolderId = selectedFolder.dataset.id
    removeFolder(selectedFolderId)
}

async function mapRemoveImage(clickedBtn){
    const selectedMeaning = clickedBtn.closest("[data-meaning]")

    if(!selectedMeaning){
        fillWarning("noSelectedMeaning", 0)
        return
    }

    const selectedMeaningId = selectedMeaning.dataset.meaning
    removeImage(selectedMeaningId)
}

async function mapAddTextMeaning(clickedBtn, popup, closestForm){
    const newMeaning = popup.querySelector("#inewTextMeaning")

    if(!newMeaning || newMeaning.value.trim().length <= 0){
        fillWarning("missingFields", 0)
    }

    const idTerm = closestForm.closest(".popup").dataset.term
    if(!idTerm) return

    addTextMeaning(newMeaning.value.trim(), idTerm)
}

async function mapAddImageMeaning(clickedBtn, popup, closestForm){
    const newMeaning = popup.querySelector("#inewImageMeaning")

    if(!newMeaning){
        fillWarning("missingFields", 0)
        return
    }

    const idTerm = closestForm.closest(".popup").dataset.term
    if(!idTerm) return

    const file = newMeaning.files[0]
    addImageMeaning(file, idTerm)
}

async function addFolder(nameFolder, clr){
    if(nameFolder === ""){
        fillWarning("emptyFolderName", 0)
        return
    }

    try{
        const response = await fetch("/api/me/folders", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                folderName: nameFolder,
                color: clr
            })
        }) 

        const data = await response.json()

        if(!response.ok){
            fillWarning(data.error, 0)
            return
        }

        // snackbar + popupEvent + refresh folderList
        fillWarning(data.message, 1)
        closePopup()
        renderFolderList(null, data.insertId)
    }catch(err){
        console.error("Server error", err)
        return
    }
}

async function addTerm(idFolder, formData){
    try{
        const response = await fetch(`/api/me/terms/${idFolder}`, {
            method: "POST",
            body: formData
        })

        const result = await response.json()
        
        if(! response.ok){
            fillWarning(result.error, 0)
            return
        }

        setWarningCookie(result.message, 1)
        window.location.href = "/dashboard"
    }catch(err){
        console.error("Server error", err)
        return
    }
}

async function editFolderData(idFolder, newName, newClr){
    try{
        if(newName === ""){
            fillWarning("emptyFolderName", 0)
            return
        }
        
        const response = await fetch("/api/me/folders", {
            method: "PUT",
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                idFolder: idFolder,
                folderName: newName,
                color: newClr
            })
        }) 

        const data = await response.json()

        if(! response.ok){
            fillWarning(data.error, 0)
            return
        }

        // snackbar + popupEvent + refresh folderList
        fillWarning(data.message, 1)
        closePopup()
        renderFolderList(null, idFolder)
    }catch(err){
        console.error("Server error", err)
        return
    }
}

async function removeFolder(idFolder){
    try{
        const response = await fetch("/api/me/folders", {
            method: "DELETE",
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                idFolder: idFolder
            })
        }) 

        const data = await response.json()

        if(! response.ok){
            fillWarning(data.error, 0)
            return
        }
        
        // snackbar + popupEvent + refresh folderList
        fillWarning(data.message, 1)
        closePopup()
        renderFolderList(null, idFolder)
    }catch(err){
        console.error("Server error", err)
        return
    }
}

async function removeImage(idMeaning){
    try{
        const response = await fetch(`/api/me/terms/meanings/image`, {
            method: "DELETE",
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                idMeaning: idMeaning
            })
        }) 

        const data = await response.json()

        if(!response.ok){
            fillWarning(data.error, 0)
            return
        }
        
        // snackbar + popupEvent + refresh folderList
        fillWarning(data.message, 1)
        closePopup()
        renderFolderList(null, localStorage.getItem("lastFolder") || -1)
    }catch(err){
        console.error("Server error", err)
        return
    }
}

async function addTextMeaning(meaningText, idTerm){
    try{
        const response = await fetch(`/api/me/terms/${idTerm}/meanings`, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                meaningContent: meaningText,
                meaningType: "text"
            })
        })

        const data = await response.json()

        if(!response.ok){
            fillWarning(data.error, 0)
            return
        }

        fillWarning(data.message, 1)
        closePopup()
        renderFolderList(null, localStorage.getItem("lastFolder") || -1)
    }catch(err){
        console.error("Server error", err)
        return
    }
}

async function addImageMeaning(imageFile, idTerm){
    try{
        const formData = new FormData()

        formData.append("image", imageFile)
        formData.append("meaningType", "image")

        const response = await fetch(`/api/me/terms/${idTerm}/meanings`, {
            method: "POST",
            credentials: "include",
            body: formData
        })

        const data = await response.json()

        if(!response.ok){
            fillWarning(data.error, 0)
            return
        }

        fillWarning(data.message, 1)
        closePopup()
        renderFolderList(null, localStorage.getItem("lastFolder") || -1)
    }catch(err){
        console.error("Server error", err)
        return
    }
}