import { setWarningCookie, fillWarning, logout, getAuth } from "../base.js"
import { closePopup } from "./dashboardGeneral.js"
import { fillFolderList } from "./userInfo.js"

const popupSubmitBtns = document.querySelectorAll(".btn.submit-popup-form")

popupSubmitBtns.forEach(btn => {
    btn.addEventListener("click", async (e) => {
        e.preventDefault()

        const routeLabel = btn.dataset.id || null

        if(routeLabel){
            const popupSection = document.querySelector(`#${routeLabel}`)

            switch(routeLabel){
                case "add-folder":
                    const nameFolder    = popupSection.querySelector("#ifolder").value
                    const clr           = popupSection.querySelector("#iclr").value

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
                    break
                case "add-term":
                    // ...
                    break
            }
        }
    })
})