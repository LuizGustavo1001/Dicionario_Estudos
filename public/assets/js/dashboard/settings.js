import { setWarningCookie, fillWarning, logout } from "../base.js"

const settingsOptions = document.querySelectorAll(".settings-aside ul li")

if(settingsOptions){
    settingsOptions.forEach(option => {
        option.addEventListener("click", () => {
            toggleSelectedOption(option.dataset.id)
        })
    })
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
        section.classList.add("inactive")

        if(section.id === selectedOption){
            section.classList.remove("inactive")
        }
    })
}
