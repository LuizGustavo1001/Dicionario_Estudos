import { setWarningCookie } from "/assets/js/base.js"
import { renderExpandedTerm } from "/assets/js/dashboard/renderContents.js"
import * as htmlToImage from 'https://esm.sh/html-to-image@1.11.11'

let overlayState = { // control wich element is using overlay
    aside: false,
    popup: false
}
export const isDesktop = () => window.innerWidth >= 1024

const asideIcons        = document.querySelectorAll(".aside-toggle-icon")

// Rounting events
function initGlobalEventListeners(){
    document.addEventListener("click", async (e) => {
        const mainAside         = document.querySelector(".main-aside")

        const openIcon      = e.target.closest(".toggle-popup-icon")
        const closeIcon     = e.target.closest(".close-popup-icon")
        const logoutIcon    = e.target.closest(".logout-btn")
        const clipboardIcon = e.target.closest(".clipboard-btn")
        const downloadIcon  = e.target.closest(".download-btn")

        const detailsSummary = e.target.closest(".details.toggle-event summary")
        const detailsDropdown = e.target.closest(".details.toggle-event .dropdown")
        const dropdownHoverEl = e.target.closest(".dropdown-hover")
        const clickedInsideDropdown = e.target.closest(".dropdown-content")
        const dropdownBox   = e.target.closest(".dropdown")

        const clickedInsidePopup = e.target.closest(".popup")

        const expandElement = e.target.closest(".expand-term")
    

        if(openIcon){
            changePopupVisibility(openIcon.dataset.id)
            
            // open popup and expand term
            if(openIcon.closest(".expand-term")){
                const term = openIcon.closest(".term")
                if(term){
                    renderExpandedTerm(term.dataset.id)
                }
            }
            return
        }

        if(closeIcon){
            closePopup()
            return
        }

        if(logoutIcon){
            logout()
            setWarningCookie("logoutSuccess", 1)
            window.location.href = "/auth/login/"
            return
        }

        if(detailsSummary || detailsDropdown){
            e.stopPropagation()
            return
        }

        if(clipboardIcon){
            copyText(clipboardIcon)
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

        if(dropdownHoverEl){
            e.preventDefault()
            e.stopPropagation()

            const currentDropdownBox = dropdownHoverEl.closest(".dropdown")
            const dropdowContent = currentDropdownBox.querySelector(".dropdown-content")
            const isOpen = dropdowContent.classList.contains("open")

            if(isOpen){
                dropdowContent.style.maxHeight = null
                dropdowContent.classList.remove("open")
            }else{
                dropdowContent.style.maxHeight = dropdowContent.scrollHeight + "px"
                dropdowContent.classList.add("open")
            }

            return
        }
        
        if(!clickedInsideDropdown && !dropdownBox){ // close dropdown clicking outside
            document.querySelectorAll(".dropdown-content.open").forEach(openedDropdown => {
                openedDropdown.style.maxHeight = null
                openedDropdown.classList.remove("open")
            })
        }

        if(!clickedInsidePopup){ // close popup clicking outside
            closePopup()
        }

        if(!isDesktop()){ // close main aside clicking out of aside container
            const clickedPopup = e.target.closest(".popup-box")
            const clickedInside = e.target.closest(".main-aside")
            const clickedToggle = e.target.closest(".aside-toggle-icon")
            
            if(!clickedInside && !clickedToggle && !clickedPopup){ 
                mainAside.classList.remove("open")
                setAsideState(false)
            }
        }
    })
}

export function closePopup(){
    const popupSections = document.querySelectorAll(".popup")

    popupSections.forEach(el => { el.classList.remove("open") })
    overlayState.popup = false
    updateOverlay()
}

export function updateOverlay(){
    const isActive = overlayState.aside || overlayState.popup
    const overlayElement = document.querySelector(".overlay-aside")

    if(overlayElement){
        overlayElement.classList.toggle("active", isActive)
    }
}

export function setAsideState(isOpen){
    overlayState.aside = isOpen
    updateOverlay()
}

export function changePopupVisibility(page){
    const popupBox = document.querySelector(".popup-box")
    const mainAside = document.querySelector(".main-aside")
    if(!popupBox) return
        
    const popupSection = popupBox.querySelector(`#${page}`)
    if(!popupSection) return

    document.querySelectorAll(".popup").forEach(popup => {
        popup.classList.remove("open")
    })

    popupSection.classList.add("open")

    // close mobile aside
    if(!isDesktop() && mainAside){
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

function copyText(icon){
    const copyTarget = document.querySelector(`.copyValue[data-copy="${icon.dataset.copy}"]`)

    if(copyTarget){
        const textToCopy = copyTarget.value || copyTarget.textContent
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