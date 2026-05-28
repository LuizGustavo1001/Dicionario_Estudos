import { setWarningCookie, fillWarning, logout, getAuth } from "/assets/js/base.js"
import { closePopup } from "/assets/js/dashboard/dashboardGeneral.js"
import { fillFolderList } from "/assets/js/dashboard/userInfo.js"
import { getFolders } from "/assets/js/getData.js"

const popupSubmitBtns = document.querySelectorAll(".btn.submit-popup-form")
if(popupSubmitBtns){
    popupSubmitBtns.forEach(btn => {
        btn.addEventListener("click", async (e) => {
            btn.classList.add("waiting")

            e.preventDefault()
            const routeLabel = btn.dataset.id || null

            const closestForm = btn.closest("form")

            if(routeLabel){
                const popupSection = document.querySelector(`#${routeLabel}`)

                switch(routeLabel){
                    case "add-folder":
                        const nameFolder    = popupSection.querySelector("#ifolder").value || null
                        const clr           = popupSection.querySelector("#iclr").value || null

                        if(nameFolder && clr) {
                            addFolder(nameFolder, clr)
                        }else{
                            fillWarning("missingFields", 0)
                            btn.classList.remove("waiting")
                        }

                        closestForm.reset()

                        break
                    case "add-term":
                        const selectedFolder = document.querySelector(".folders-list li.selected")
                        if(! selectedFolder){
                            btn.classList.remove("waiting")
                            fillWarning("folderNotSelected", 0)
                            break
                        }

                        const folderId      = selectedFolder.dataset.id
                        const newTermName   = popupSection.querySelector("#iterm").value || null
                        const meanings      = popupSection.querySelectorAll(".term-input, .image-input")

                        const formData = new FormData()
                        formData.append("idFolder", folderId)
                        formData.append("termName", newTermName)

                        let hasValidMeaning = false
                        let meaningsMap = [] // temp array

                        meanings.forEach((meaning) => {
                            const isTextValid = meaning.name !== "image" && meaning.value.trim() !== ""
                            const isFileValid = meaning.name === "image" && meaning.type === "file" && meaning.files.length > 0

                            if(isTextValid || isFileValid){
                                hasValidMeaning = true

                                if(meaning.name == "image"){
                                    const file = meaning.files[0]

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

                            closestForm.reset()
                        }else{
                            btn.classList.remove("waiting")
                            fillWarning("missingFields", 0)
                        }

                        break
                    case "edit-folder":
                        // retrieve selected folder data
                        const currentIdFolder = document.querySelector("#edit-folder-info").dataset.folder || null
                        if(!currentIdFolder) break

                        const newNameFolder    = popupSection.querySelector("#inameFolder").value || null
                        const newClr           = popupSection.querySelector("#inewClr").value || null

                        if(newNameFolder && newClr) editFolderData(currentIdFolder, newNameFolder, newClr)
                                
                        btn.classList.remove("waiting")
                        closestForm.reset()

                        break
                    case "remove-folder":

                        break
                    default:
                        btn.classList.remove("waiting")
                        console.error('System error')
                        break
                }
            }
        })
    })
}


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
        console.log(data)

        if(! response.ok){
            fillWarning(data.error, 0)
            return
        }

        // snackbar + popupEvent + refresh folderList
        fillWarning(data.message, 1)
        closePopup()
        fillFolderList(data.insertId)
    }catch(err){
        console.error("Server error", err)
    }
}

async function addTerm(idFolder, formData){
    try{
        const response = await fetch("/users/me/folders/terms/add", {
            method: "POST",
            body: formData
        })

        const result = await response.json()
        
        if(! response.ok){
            fillWarning(result.error, 0)
            return
        }

        fillWarning(result.message, 1)
        closePopup()
        fillFolderList(idFolder)
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
        fillFolderList(idFolder)
    }catch(err){
        console.error("Server error", err)
    }
}