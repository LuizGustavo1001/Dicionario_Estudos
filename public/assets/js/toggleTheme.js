
const toggleThemeBtn    = document.querySelectorAll(".toggle-theme-box")
const savedTheme        = localStorage.getItem("theme")

toggleThemeBtn.forEach(button => {
    button.addEventListener("click", toggleTheme)
})

if(localStorage.getItem("theme") === "dark"){
    toggleTheme()
}

// initializing
if(savedTheme){
    applyTheme(savedTheme)
}else{ // verify browser prefer theme
    const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches

    applyTheme(prefersDark ? "dark" : "light")
}

// Functions
function applyTheme(theme){
    const isDark = theme === "dark"

    document.body.classList.toggle("dark-mode", isDark)

    document.querySelectorAll(".toggle-theme-box svg").forEach(icon => {
        icon.classList.toggle("inactive")
    })

    localStorage.setItem("theme", theme)
}

function toggleTheme(){
    const isDark = document.body.classList.contains("dark-mode")

    applyTheme(isDark ? "light" : "dark")
}