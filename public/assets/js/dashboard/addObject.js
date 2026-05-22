import { setWarningCookie, fillWarning, logout, getAuth } from "/assets/js/base.js"
import { closePopup } from "/assets/js/dashboard/dashboardGeneral.js"
import { fillFolderList } from "/assets/js/dashboard/userInfo.js"
import { getFolders } from "/assets/js/getData.js"

const popupSubmitBtns = document.querySelectorAll(".btn.submit-popup-form")
if(popupSubmitBtns){
    popupSubmitBtns.forEach(btn => {
        btn.addEventListener("click", async (e) => {
            e.preventDefault()
            const routeLabel = btn.dataset.id || null

            if(routeLabel){
                const popupSection = document.querySelector(`#${routeLabel}`)

                switch(routeLabel){
                    case "add-folder":
                        const nameFolder    = popupSection.querySelector("#ifolder").value || null
                        const clr           = popupSection.querySelector("#iclr").value || null

                        if(nameFolder && clr) addFolder(nameFolder, clr)

                        break
                    case "add-term":
                        // ...
                        break
                    case "edit-folder":
                        // retrieve selected folder data
                        const currentIdFolder = document.querySelector("#edit-folder-info").dataset.folder || null
                        if(!currentIdFolder) break

                        const newNameFolder    = popupSection.querySelector("#inameFolder").value || null
                        const newClr           = popupSection.querySelector("#inewClr").value || null

                        if(newNameFolder && newClr) editFolderData(currentIdFolder, newNameFolder, newClr)
                            
                        break
                    default:
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
        fillFolderList()
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

        const userFolders = await getFolders()
        const folder = userFolders.filter(f => f.idFolder == idFolder)[0]
        
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
        fillFolderList()
    }catch(err){
        console.error("Server error", err)
    }
}