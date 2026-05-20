
const toggleThemeBoxes    = document.querySelectorAll(".toggle-theme-box")

initializeTheme()

toggleThemeBoxes.forEach(select => {
    select.addEventListener("change", (e) => {
        const themeOption = e.target.value
        const actualTheme = (themeOption === "system") ? verifyBrowserPrefers() : themeOption

        applyTheme(actualTheme, true, themeOption)
    })
})

function initializeTheme(){
    const savedTheme = localStorage.getItem("theme") || "system"
    const themeToApply = (savedTheme === "system") ? verifyBrowserPrefers() : savedTheme

    // update selected option
    toggleThemeBoxes.forEach(box => {box.value = savedTheme})

    applyTheme(themeToApply, false, savedTheme) // avoid overwrite, just initializing
}

function applyTheme(theme, saveToStorage = true, valueToSave = null){
    document.body.classList.toggle("dark-mode", theme === "dark")

    if(saveToStorage){
        localStorage.setItem("theme", valueToSave)
    }
}

function verifyBrowserPrefers(){
    return window.matchMedia("(prefers-color-scheme: dark)").matches
}