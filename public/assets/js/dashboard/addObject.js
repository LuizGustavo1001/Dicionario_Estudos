import { setWarningCookie, fillWarning } from "/assets/js/base.js"
import { closePopup } from "/assets/js/dashboard/dashboardGeneral.js"
import { renderFolderList } from "/assets/js/dashboard/renderContents.js"

const popupSubmitBtns = document.querySelectorAll(".btn.submit-popup-form, .btn.warning-btn")
if(popupSubmitBtns){
    popupSubmitBtns.forEach(btn => {
        btn.addEventListener("click", async (e) => {
            btn.classList.add("waiting")
            e.preventDefault()

            const routeLabel = btn.dataset.id || null

            if(routeLabel){
                const popupSection = document.querySelector(`#${routeLabel}`)

                if(routeLabel === "add-folder"){
                    mapAddFolder(btn, popupSection)
                }else if(routeLabel === "add-term"){
                    mapAddTerm(btn, popupSection)
                }else if(routeLabel === "edit-folder"){
                    mapEditFolder(btn, popupSection)
                }else if(routeLabel === "rmv-folder"){
                    mapRemoveFolder(btn)
                }else{
                    btn.classList.remove("waiting")
                    console.error('System error')
                }
            }
        })
    })
}

async function mapAddFolder(clickedBtn, popup){
    const closestForm   = clickedBtn.closest("form")
    const nameFolder    = popup.querySelector("#ifolder").value || null
    const clr           = popup.querySelector("#iclr").value || null

    if(nameFolder && clr){
        addFolder(nameFolder, clr)
        clickedBtn.classList.remove("waiting")
    }else{
        fillWarning("missingFields", 0)
        clickedBtn.classList.remove("waiting")
        return
    }

    closestForm.reset()
}

async function mapAddTerm(clickedBtn, popup){
    const selectedFolder = document.querySelector(".folders-list li.selected")
    if(! selectedFolder){
        clickedBtn.classList.remove("waiting")
        fillWarning("folderNotSelected", 0)
        return
    }
    
    const closestForm   = clickedBtn.closest("form")
    const folderId      = selectedFolder.dataset.id
    const newTermName   = popup.querySelector("#iNewTerm").value || null
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
                    content: meaning.value
                })
            }
        }
    })

    if(newTermName && hasValidMeaning){
        formData.append("meanings", JSON.stringify(meaningsMap)) // JSON structure
        addTerm(folderId, formData)
        clickedBtn.classList.remove("waiting")
        closestForm.reset()
    }else{
        clickedBtn.classList.remove("waiting")
        fillWarning("missingFields", 0)
        return
    }
}

async function mapEditFolder(clickedBtn, popup){
    // retrieve selected folder data
    const currentIdFolder = document.querySelector("#edit-folder-info").dataset.folder || null
    if(!currentIdFolder){
        clickedBtn.classList.remove("waiting")
        fillWarning("noSelectedFolder", 0)
        return
    }

    const closestForm      = clickedBtn.closest("form")
    const newNameFolder    = popup.querySelector("#inameFolder").value || null
    const newClr           = popup.querySelector("#inewClr").value || null

    if(newNameFolder && newClr) {
        editFolderData(currentIdFolder, newNameFolder, newClr)
    }

    clickedBtn.classList.remove("waiting")
    closestForm.reset()
}

async function mapRemoveFolder(clickedBtn){
    const selectedFolder = document.querySelector(".folders-list li.selected")

    if(!selectedFolder){
        clickedBtn.classList.remove("waiting")
        fillWarning("noSelectedFolder", 0)
    }

    const selectedFolderId = selectedFolder.dataset.id

    // confirm warning button logic here...

    clickedBtn.classList.remove("waiting")
    removeFolder(selectedFolderId)
}

async function removeTermMap(){}

async function removeMeaningMap(){}

async function addFolder(nameFolder, clr){
    if(nameFolder === ""){
        fillWarning("emptyFolderName", 0)
        return
    }

    try{
        const response = await fetch("/users/me/add/folder", {
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

        if(! response.ok){
            fillWarning(data.error, 0)
            return
        }

        // snackbar + popupEvent + refresh folderList
        fillWarning(data.message, 1)
        closePopup()
        renderFolderList(null, data.insertId)
    }catch(err){
        console.error("Server error", err)
    }
}

async function addTerm(idFolder, formData){
    try{
        const response = await fetch("/users/me/add/term", {
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
    }
}

async function editFolderData(idFolder, newName, newClr){
    try{
        if(newName === ""){
            fillWarning("emptyFolderName", 0)
            return
        }
        
        const response = await fetch("/users/me/edit/folder", {
            method: "POST",
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
    }
}

async function removeFolder(idFolder){
    try{
        const response = await fetch("/users/me/remove/folder", {
            method: "POST",
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
    }
}