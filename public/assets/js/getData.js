export async function getUserInfo(){
    try{
        const response = await fetch(`/api/me`, {
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
        const response = await fetch("/api/me/folders", {
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
        const foldersParam = folders.join(",")

        const response = await fetch(`/api/me/terms?folders=${foldersParam}`, {
            method: "GET",
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include"
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
        const folderTerms = await getFolderTerms()

        const terms = folderTerms.map(t => t.idTerm)

        const termsParam = terms.join(",")

        const response = await fetch(`/api/me/meanings?terms=${termsParam}`, {
            method: "GET",
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include"
        })

        const data = await response.json()
        return data
    }catch(err){
        console.error("Failure to fetch term meanings: ", err)
        return null
    }
}