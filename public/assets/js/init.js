import { setWarningCookie } from "/assets/js/base.js"
import * as htmlToImage from 'https://esm.sh/html-to-image@1.11.11'

export let overlayState = { // control wich element is using overlay
    aside: false,
    popup: false
}
export const isDesktop = () => window.innerWidth >= 1024

// Rounting events
function initGlobalEventListeners(){
    document.addEventListener("click", async (e) => {
        const openIcon      = e.target.closest(".toggle-popup-icon")
        const closeIcon     = e.target.closest(".close-popup-icon")
        const logoutIcon    = e.target.closest(".logout-btn")
        const detailsElements = e.target.closest(".details.toggle-event")
        const clipboardIcon = e.target.closest(".clipboard-btn")
        const downloadIcon  = e.target.closest(".download-btn")
        const dropdownBox   = e.target.closest(".dropdown")
        const clickedInsideDropdown = e.target.closest(".dropdown-content")

        if(openIcon){
            e.stopPropagation()
            changePopupVisibility(openIcon.dataset.id)
            return
        }

        if(closeIcon){
            overlayState.popup = false
            closePopup()
            updateOverlay()
            return
        }

        if(logoutIcon){
            logout()
            setWarningCookie("logoutSuccess", 1)
            window.location.href = "/auth/login/"
            return
        }

        if(detailsElements){
            toggleDetails(detailsElements)
            return
        }

        if(clipboardIcon){
            clipboardIcon.addEventListener("click", () => { copyText(clipboardIcon) })
            return
        }
        
        if(downloadIcon){
            e.stopPropagation()
            let targetElement = null

            if(downloadIcon.dataset.element){
                targetElement = document.querySelector(downloadIcon.dataset.element)
            }else{
                targetElement = downloadIcon.closest(".downloadable")
            }

            if(targetElement){
                await downloadObject(targetElement)
            }else{
                console.warn("No capturable object found for this button")
            }
            return
        }

        if(dropdownBox){
            const dropdownHoverEl   = dropdownBox.querySelector(".dropdown-hover")
            const dropdowContent    = dropdownBox.querySelector(".dropdown-content")

            dropdownHoverEl.addEventListener("click", (e) => {
                e.preventDefault()
                e.stopPropagation()

                const isOpen = dropdowContent.classList.contains("open")

                if(isOpen){ // close logic
                    dropdowContent.style.maxHeight = null
                    dropdowContent.classList.remove("open")

                }else{ // open logic
                    dropdowContent.style.maxHeight = dropdowContent.scrollHeight + "px";
                    dropdowContent.classList.add("open");
                }
            })

            return
        }
        
        if(!clickedInsideDropdown && !dropdownBox){ // document event click outside dropdownBox
            document.querySelectorAll(".dropdown-content.open").forEach(openedDropdown => {
                openedDropdown.style.maxHeight = null
                openedDropdown.classList.remove("open")
            })
            return
        }

    })
}

function closePopup(){
    const popupSections = document.querySelectorAll(".popup")

    popupSections.forEach(el => { el.classList.remove("open") })
    overlayState.popup = false
}

export function updateOverlay(){
    const isActive = overlayState.aside || overlayState.popup
    const overlayElement = document.querySelector(".overlay-aside")

    if(overlayElement){
        overlayElement.classList.toggle("active", isActive)
    }
}

export function changePopupVisibility(page){
    const popupBox = document.querySelector(".popup-box")
    if(!popupBox) return
        
    const popupSection = popupBox.querySelector(`#${page}`)
    if(!popupSection) return

    popupSection.classList.add("open")

    // close mobile aside
    if(!isDesktop()){
        mainAside.classList.remove("open")
        overlayState.aside = false
    }
    
    overlayState.popup = true
    updateOverlay()
}

export async function logout(){
    try{
        const response = await fetch("/api/logout", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include"
        })

        return await response.json()
    }catch(err){
        console.error("Failure trying to logout: ", err)
        return null
    }
}

function toggleDetails(el){
    const summary   = el.querySelector("summary")
    const dropdown  = el.querySelector(".dropdown")

    if(summary){
        summary.addEventListener("click", (e) => {
            e.stopPropagation()
        })
    }

    // avoid drodown click from affect details
    if(dropdown){
        dropdown.addEventListener("click", (e) => {
            e.stopPropagation()
        })
    }
}

function copyText(icon){
    const copyTarget = document.querySelector(`.copyValue[data-copy="${icon.dataset.copy}"]`)

    if(copyTarget){
        const textToCopy = copyTarget.value || copyTarget.textContent;
        navigator.clipboard.writeText(textToCopy)
    }

    // icon animation
    icon.classList.add("clicked")
    setTimeout(() => icon.classList.remove("clicked"), 1000)
}

async function downloadObject(element){
    try{
        const blob = await htmlToImage.toBlob(element)

        // temp download link
        const link = document.createElement("a")
        link.download = 'copy-element.png'
        link.href = URL.createObjectURL(blob)
        link.click()
        URL.revokeObjectURL(link.href)

        try{
            const data = [new ClipboardItem({ 'image/png': blob })]   
            await navigator.clipboard.write(data)
            console.log("Image copied to the clipboard with success!")
        }catch(error){
            console.warn("Browser does not support image copy to clipboard: ", error)
        }
    }catch(err){
        console.error("Error trying to generate image: ", err)
    }        
}

initGlobalEventListeners()