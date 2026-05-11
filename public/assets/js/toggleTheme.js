
const toggleThemeBtn = document.querySelectorAll(".toggle-theme")

toggleThemeBtn.forEach(button => {
    button.addEventListener("click", toggleTheme)
})

function applyTheme(theme){
    const isDark = theme === "dark"

    document.body.classList.toggle("dark-mode", isDark)

    document.querySelectorAll(".toggle-theme svg").forEach(icon => {
        icon.classList.toggle("inactive")
    })

    localStorage.setItem("theme", theme)
}

function toggleTheme(){
    const isDark = document.body.classList.contains("dark-mode")

    applyTheme(isDark ? "light" : "dark")
}

if(localStorage.getItem("theme") === "dark"){
    toggleTheme()
}

// initializing
const savedTheme = localStorage.getItem("theme")

if(savedTheme){
    applyTheme(savedTheme)
}else{
    const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches

    applyTheme(prefersDark ? "dark" : "light")
}