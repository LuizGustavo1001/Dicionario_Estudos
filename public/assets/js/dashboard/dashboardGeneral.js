import { setWarningCookie, fillWarning, logout, getAuth } from "../baseController.js"

// Async functions
const auth = getAuth()

if(!auth){
    window.localStorage.href = '/auth/login'
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

openPopupIcons.forEach(icon => { // Settings popup open
    icon.addEventListener("click", () => {
        changePopupVisibility(icon.dataset.id)
    })
})

popupCloseIcons.forEach(icon => { // Settings popup close
    icon.addEventListener("click", closePopup)
})


//initCheckAuth()
handleResize2Aside()


// Functions
function updateOverlay(){
    const isActive = overlayState.aside || overlayState.popup
    overlayAside.classList.toggle("active", isActive)
    overlayAside.classList.toString("active", !isActive)
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

function closePopup(){
    const popupSections = popupBox.querySelectorAll(".popup")
    popupSections.forEach(section => {
        section.classList.add("inactive")
    })

    overlayState.popup = false
    updateOverlay()
}