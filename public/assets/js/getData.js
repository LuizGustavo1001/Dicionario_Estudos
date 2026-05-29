export async function getUserInfo(){
    try{
        const response = await fetch(`/users/me`, {
            method: "GET",
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include"
        })

        const data = await response.json()
        return data
    }catch(err){
        console.error("Failure trying to return user data: ", err)
        return null
    }
}

export async function getFolders(){
    try{
        const response = await fetch("/users/me/get/folders", {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-type": "application/json"
            }
        })

        const data = await response.json()
        return data
    }catch(err){
        console.error("Failure trying to fetch folders: ", err)
        return null
    }
}

export async function getFolderTerms(){
    try{
        const userFolders = await getFolders()

        const folders = userFolders.map(f => f.idFolder)

        const response = await fetch("/users/me/get/terms", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ 
                folders: folders
            })
        })

        const data = await response.json()
        return data
    }catch(err){
        console.error("Failure to fetch folder terms: ", err)
        return null
    }
}

export async function getTermMeanings(){
    try{
        const folderTerms   = await getFolderTerms()

        const terms = folderTerms.map(t => t.idTerm)

        const response = await fetch("/users/me/get/meanings", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                terms: terms
            })
        })

        const data = await response.json()
        return data
    }catch(err){
        console.error("Failure to fetch term meanings: ", err)
        return null
    }
}