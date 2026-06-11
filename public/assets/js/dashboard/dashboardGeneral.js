import { getAuth } from "/assets/js/base.js"
import {isDesktop, setAsideState } from "../init.js"

const authStatus = await getAuth()
if(!authStatus){
    window.location.href = "/auth/login"
}else if(authStatus === "pending_confirmation"){
    window.location.href = "/auth/confirmToken"
}

const desktopMedia      = window.matchMedia("(min-width: 1024px)")
const asideIcons        = document.querySelectorAll(".aside-toggle-icon")
const mainAside         = document.querySelector(".main-aside")
const addFolderForm     = document.querySelector("#add-folder form")
const editFolderForm    = document.querySelector("#edit-folder form")
const settingsOptions   = document.querySelectorAll(".settings-aside ul li")
const addTermInputAreaBtns = document.querySelectorAll("#add-term .add-input")

desktopMedia.addEventListener("change", handleResize2Aside)

// Main aside visibility event
if(asideIcons.length > 0){
    asideIcons.forEach(icon => {
        icon.addEventListener('click', toggleAside)
    })
}

if(addTermInputAreaBtns.length > 0){
    addTermInputAreaBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            addInput(btn.id)
        })
    })
}

// settings aside options click event
if(settingsOptions){
    settingsOptions.forEach(option => {
        option.addEventListener("click", () => {
            toggleSelectedOption(option.dataset.id)
        })
    })
}

// Functions
function toggleAside(){
    if(!mainAside) return
    const isOpen = mainAside.classList.toggle("open")

    if(!isDesktop()){
        setAsideState(isOpen)
    }
}

function handleResize2Aside(){
    if(!mainAside) return
    const desktop = isDesktop()

    mainAside.classList.toggle("open", desktop)
    
    if(desktop || !desktop){
        setAsideState(false)
    }
}

function toggleColorInputEvent(formContainer){ // toggle input color value
    const circles       = formContainer.querySelectorAll(".clr-circle")
    const colorInput    = formContainer.querySelector("#iclr") || formContainer.querySelector("#inewClr")

    if (!colorInput) return

    circles.forEach(circle => {
        circle.addEventListener("click", () => { changeColor(circle.dataset.color) })
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

function addInput(type){
    const textInputAmount   = document.querySelectorAll("#add-term .term-input").length
    const imageInputAmount  = document.querySelectorAll("#add-term .image-input").length

    const fieldset = document.createElement("fieldset")
    fieldset.classList.add("input-fieldset")

    const legend = document.createElement("legend")
    legend.classList.add("label")

    const input = document.createElement("input")
    input.classList.add("input")

    if(type == "add-text"){
        //legend.setAttribute("for", `itext#${textInputAmount+ 1}`)
        legend.textContent = `Significado Texto #${textInputAmount+ 1}`

        input.type = "text"
        input.name = `text`
        input.id = `itext#${textInputAmount+ 1}`
        input.classList.add("term-input")
        input.placeholder = "Máximo 300 caracteres"
        input.autocapitalize = "on"
    }else{
        legend.setAttribute("for", `iimage#${imageInputAmount+ 1}`)
        legend.textContent = `Significado Imagem #${imageInputAmount+ 1}`

        input.type = "file"
        input.accept = "image/*"
        input.name = `image`
        input.id = `iimage#${imageInputAmount+ 1}`
        input.classList.add("image-input")
    }

    fieldset.append(legend, input)

    const inputBox = document.querySelector(".inputs-box")
    inputBox.insertAdjacentElement("beforeend", fieldset)
}

function dashboardInit(){
    handleResize2Aside()
    if(addFolderForm) toggleColorInputEvent(addFolderForm)
    if(editFolderForm) toggleColorInputEvent(editFolderForm)
    
    // remove all skeleton nodes...
}

function toggleSelectedOption(selectedOption){
    settingsOptions.forEach(option => {
        option.classList.remove("selected")
        if(option.dataset.id === selectedOption){
            option.classList.add("selected")
        }
    })

    const sections = document.querySelectorAll(".section-content")
    sections.forEach(section => {
        section.classList.remove("open")

        if(section.id === selectedOption){
            section.classList.add("open")
        }
    })
}

dashboardInit()