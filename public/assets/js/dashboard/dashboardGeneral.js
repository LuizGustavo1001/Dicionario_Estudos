import { setWarningCookie, fillWarning, logout, getAuth } from "/assets/js/base.js"

const authStatus = await getAuth()

if(!authStatus){
    window.location.href = "/auth/login"
}else if(authStatus === "pending_confirmation"){
    window.location.href = "/auth/confirmToken"
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
const addFolderForm     = document.querySelector("#add-folder form")
const editFolderForm    = document.querySelector("#edit-folder form")
const searchTermInput   = document.querySelector("#isearch-term")
const heroAsideNav      = document.querySelector(".aside-hero .aside-nav")

desktopMedia.addEventListener("change", handleResize2Aside)

logoutBtn.addEventListener("click", initLogout)

asideIcons.forEach(icon => { // Main aside visibility event
    icon.addEventListener('click', toggleAside)
})

export async function openPopupEvent(){
    openPopupIcons.forEach(icon => {
        icon.addEventListener("click", (e) => {
            e.stopPropagation()
            changePopupVisibility(icon.dataset.id)
        })
    })
}

export async function closePopupEvent(){
    popupCloseIcons.forEach(icon => { 
        icon.addEventListener("click", closePopup)
    })
}

document.addEventListener("click", (e) => { // Mobile aside toggle
    if(!isDesktop()){
        const clickedPopup = e.target.closest(".popup-box")
        const clickedInside = e.target.closest(".main-aside")
        const clickedToggle = e.target.closest(".aside-toggle-icon")
        
        if(!clickedInside && !clickedToggle && !clickedPopup){ // avoid event when popup is opened
            mainAside.classList.remove("open")

            overlayState.aside = false
            updateOverlay()
        }
    }
})


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

    popupSection.classList.add("open")

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
        section.classList.remove("open")
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
export function toggleDetailsEvent(){
    const toggles = document.querySelectorAll("details.toggleEvent")

    toggles.forEach(el => {
        const summary = el.querySelector("summary")
        const content = el.querySelector(".content")

        if(!summary || !content) return

        summary.addEventListener("click", function(e) {
            e.preventDefault()

            const isOpen = content.classList.contains("open")

            if(isOpen){ // close logic
                content.style.maxHeight = null
                content.classList.remove("open")
                el.classList.remove("open")

                // waiting CSS animation timer
                setTimeout(() => {
                    el.removeAttribute("open")
                }, 300)
            }else{ // open logic
                el.setAttribute("open", "")
                el.classList.add("open")

                requestAnimationFrame(() => {
                    content.style.maxHeight = content.scrollHeight + "px";
                    content.classList.add("open");
                })
            }
        })
    })
}

const addTermInputAreaBtns = document.querySelectorAll(".add-term-area button")
addTermInputAreaBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        addInput(btn.id)
    })
})

function addInput(type){
    const textInputAmount   = document.querySelectorAll("#add-term .term-input").length
    const imageInputAmount  = document.querySelectorAll("#add-term .image-input").length

    const formInputBox = document.createElement("div")
    formInputBox.classList.add("form-input-box", "input-box-w-label")

    const label = document.createElement("label")

    const input = document.createElement("input")
    input.classList.add("input")

    if(type == "add-text"){
        label.setAttribute("for", `itext#${textInputAmount+ 1}`)
        label.textContent = `Significado Texto #${textInputAmount+ 1}`

        input.type = "text"
        input.name = `text${textInputAmount+ 1}`
        input.id = `itext#${textInputAmount+ 1}`
        input.classList.add("term-input")
        input.placeholder = "Máximo 300 caracteres"
        input.autocapitalize = "on"
    }else{
        label.setAttribute("for", `iimage#${imageInputAmount+ 1}`)
        label.textContent = `Significado Imagem #${imageInputAmount+ 1}`

        input.type = "file"
        input.accept = "image/*, .pdf"
        input.name = `image#${imageInputAmount+ 1}`
        input.id = `iimage#${imageInputAmount+ 1}`
        input.classList.add("image-input")
    }

    formInputBox.append(label, input)

    const inputBox = document.querySelector(".inputs-box")
    inputBox.insertAdjacentElement("beforeend", formInputBox)
}


handleResize2Aside()
if(addFolderForm) addFolderEvent(addFolderForm)
if(editFolderForm) addFolderEvent(editFolderForm)
openPopupEvent()
closePopupEvent()