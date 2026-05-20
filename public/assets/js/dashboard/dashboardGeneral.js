import { setWarningCookie, fillWarning, logout, getAuth } from "../base.js"

const auth = await getAuth()

if(!auth){
    window.location.href = '/auth/login'
}

async function initLogout(){ // logout
    try{
        const data = await logout()

        if(data?.success){
            setWarningCookie("logoutSuccess", 1)
            window.location.href = "/auth/login"
        }
    }catch(err){
        console.error("Logout error:", err)
    }
}

const isDesktop = () => window.innerWidth >= 1024
let overlayState = { // control wich element is using overlay
    aside: false,
    popup: false
}

const mainAside         = document.querySelector(".main-aside")
const asideIcons        = document.querySelectorAll(".aside-toggle-icon")
const overlayAside      = document.querySelector(".overlay-aside")
const overlayPopup      = document.querySelector(".overlay-popup")
const desktopMedia      = window.matchMedia("(min-width: 1024px)")
const logoutBtn         = document.querySelector(".logout-btn")
const popupBox          = document.querySelector(".popup-box")
const openPopupIcons    = document.querySelectorAll(".toggle-popup-icon")
const popupCloseIcons   = document.querySelectorAll(".close-popup-icon")

desktopMedia.addEventListener("change", handleResize2Aside)

logoutBtn.addEventListener("click", initLogout)

asideIcons.forEach(icon => { // Main aside visibility event
    icon.addEventListener('click', toggleAside)
})

document.addEventListener("click", (e) => { // Mobile aside toggle
    if(!isDesktop()){
        const clickedPopup = e.target.closest(".popup-box")
        const clickedInside = e.target.closest(".main-aside")
        const clickedToggle = e.target.closest(".aside-toggle-icon")
        
        if(!clickedInside && !clickedToggle && !clickedPopup){ // avoid event when popup are open
            mainAside.classList.remove("open")

            overlayState.aside = false
            updateOverlay()
        }
    }
})

openPopupIcons.forEach(icon => {
    icon.addEventListener("click", () => {
        changePopupVisibility(icon.dataset.id)
    })
})

popupCloseIcons.forEach(icon => { // Settings popup close
    icon.addEventListener("click", closePopup)
})


handleResize2Aside()

const addFolderForm = document.querySelector("#add-folder form")
const editFolderForm = document.querySelector("#edit-folder form")

if(addFolderForm) addFolderEvent(addFolderForm)

if(editFolderForm) addFolderEvent(editFolderForm)

// Functions
function updateOverlay(){
    const isActive = overlayState.aside || overlayState.popup
    overlayAside.classList.toggle("active", isActive)
}

function toggleAside(){
    const isOpen = mainAside.classList.toggle("open")

    if(!isDesktop()){
        overlayState.aside = isOpen
        updateOverlay()
    }
}

function handleResize2Aside(){
    const desktop = isDesktop()

    mainAside.classList.toggle("open", desktop)
    
    if(desktop){
        overlayState.aside = false
    }

    updateOverlay()
}

function changePopupVisibility(page){
    const popupSection = popupBox.querySelector(`#${page}`)
    if(!popupSection) return

    popupSection.classList.remove("inactive")

    // close mobile aside
    if(!isDesktop()){
        mainAside.classList.remove("open")
        overlayState.aside = false
    }
    
    overlayState.popup = true
    updateOverlay()
}

export function closePopup(){
    const popupSections = popupBox.querySelectorAll(".popup")
    popupSections.forEach(section => {
        section.classList.add("inactive")
    })

    overlayState.popup = false
    updateOverlay()
}

// toggle input color value
function addFolderEvent(formContainer){
    const circles = formContainer.querySelectorAll(".clr-circle")
    const colorInput = formContainer.querySelector("#iclr") || formContainer.querySelector("#inewClr")

    if (!colorInput) return

    circles.forEach(circle => {
        circle.addEventListener("click", () => {changeColor(circle.dataset.color)})
    })

    // match input with the clr-circle
    colorInput.addEventListener("input", (e) => {
        const chosenColor = e.target.value.toUpperCase()

        circles.forEach(circle => {
            circle.classList.toggle("selected", circle.dataset.color.toUpperCase() === chosenColor)
        })
    })

    function changeColor(color){
        circles.forEach(circle => {
            circle.classList.toggle("selected", circle.dataset.color === color)
        })
        colorInput.value = color
    }
}

// collapsible object event listener
export function toggleCollpsedEvent(){
    const toggles = document.querySelectorAll(".collapsible")

    toggles.forEach(toggle => {
        toggle.addEventListener("click", function() {
            const content = this.nextElementSibling
            const isOpen = content.classList.contains("open")

            this.classList.toggle("active")
            this.setAttribute("aria-expanded", !isOpen)

            // animation logic
            if(isOpen){
                content.style.maxHeight = null
                content.classList.remove("open")
            }else{
                content.style.maxHeight = content.scrollHeight + "px"
                content.classList.add("open")
            }
        })
    })
}


