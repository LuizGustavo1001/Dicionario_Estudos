<div align="center">

<p>
	<a href="https://www.figma.com/design/IXFWToCU5IPiRxfdEWoBlv/Dicion%C3%A1rio-Estudos?node-id=0-1&p=f&t=oDgolX2wiWevBFmC-0">	
	  <img src="https://img.shields.io/badge/Figma%20Project-F24E1E?logo=figma&logoColor=white" alt="Figma Project">
	</a>
	<a href="https://cloudinary.com/">	
	  <img src="https://img.shields.io/badge/Cloudinary-0061FF?logo=cloudinary&logoColor=fff" alt="Cloudinary">
	</a>
	<a href="https://www.mysql.com/">	
	  <img src="https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=fff" alt="MySQL">
	</a>
	<a href="https://docs.docker.com/compose/">	
	  <img src="https://img.shields.io/badge/Docker-0061FF?logo=docker&logoColor=fff" alt="Docker">
	</a>
	<a href="https://www.npmjs.com/">
	  <img src="https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=fff" alt="NPM">
	</a>
	<a href="https://www.w3schools.com/js/DEFAULT.asp">
	  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000" alt="JavaScript">
	</a>
	<a href="https://www.jwt.io/">	
	  <img src="https://img.shields.io/badge/JWT-black?logo=jsonwebtokens&logoColor=fff" alt="JWT">
	</a>
	<a href="https://sass-lang.com/">
	  <img src="https://img.shields.io/badge/Sass-C69?logo=sass&logoColor=fff" alt="Sass">
	</a>
	<a href="https://nodejs.org">
	  <img src="https://img.shields.io/badge/Node.js-6DA55F?logo=node.js&logoColor=white" alt="Node.js">
	</a>
	<a href="https://expressjs.com/en/">
	  <img src="https://img.shields.io/badge/Express.js-%23404d59.svg?logo=express&logoColor=%2361DAFB" alt="Express.js">
	</a>
</p>

<img src="https://res.cloudinary.com/dxfelxvyy/image/upload/q_auto/f_auto/v1781096574/asd_wmlujk.avif" width="600px">

# `Dicionário de Estudos`

</div>

Dicionário de Estudos is a robust platform developed for **customized organization terms**. The system works as a **vocabulary manager** focused on **students and researchers** who need a space to centralize their Knowledge in an intuitive way. 

The application allows **users** to:
- **Create Folders** separated by personalized colors.
- **Group Terms** inside Folders.
- **Store Meanings*** inside Terms.
- **Search** for Terms and Folders.

> `*` Each Term can have multiple meanings, categorized as either **plain text** or **dynamic image upload** 
## System Architecture
1. **REST Architecture for API**
	- Every communication between client and server is made using a **RESTful API**.
	- **CRUD** operations can be performed for users, folders, terms and meanings data. Responding entirely in **JSON** format.
2. **Secure Authentication with JWT**
	- User and folders data integrity ensured by **JWT (JSON Web Token)**.
	- When logging in, user receive an encrypted token to validate subsequent requests safely.
3. **Docker Container**
	- Encapsulated application structure using **Docker** and **Docker Compose**, making project startup easier across varied environments without local dependency conflicts.
4. **Hybrid Files Storage (Cloudinary)**
	- The meaning image upload are processed asynchronously.
	- System receives the temporary file at `/uploads` folder and send to the cloud through Cloudinary API.
		- Saving just the optimized image URL in the database.
## Project Architecture
```
public/                  # Static files (HTML pages)
|-- assets/              # Front-End Scripts, Compiled CSS through SCSS
src/                     # Back-End application
|-- controller/          # Requirements Controllers
|-- database/            # MySQL database connection and settings
|-- middleware/          # Middlewares (Ex: user JWT check)
|-- models/              # Data Structures Entities for database
|-- routes/              # API REST endpoints
|-- app.js               # Node.js application entrypoint
uploads/                 # Temp image store (Before Cloudinary upload)
```
## API Endpoints
The API was builded  using:
- **JSON** format to communicate
- **JWT** to control access to protected routes
- Protected routes are identified by the prefix: `/me`
#### Example
1. **Login (Success):** 
	- Endpoint: `POST /login`
	- Response: 200 (OK)
```JSON
{
	"message": "loginSuccess"
}
```
2. **User Folders:**
	- Endpoint: `GET /me/folders`
	- Response: 200 (OK)
```JSON
[
	{
		"idFolder": 1,
		"nameFolder": "Cantonose Leaning",
		"colorFolder": "#c785ee",
		"idUser": 1
	},
	{
		"idFolder": 2,
		"nameFolder": "HTTP Studies",
		"colorFolder": "#eda35a",
		"idUser": 1
	}
]
```
3. **Login (Missing Fields):**
	- Endpoint: `POST /login`
	- Response: 400 (Bad Request)
```JSON
{
	"error": "missingFields"
}
```
## Run Project
### Pre-Requirements 
- `Node.js`
-  `NPM` 
- `Docker` and `Docker Compose`
### Cloning Repository
``` Shell
git clone https://github.com/LuizGustavo1001/Dicionario_Estudos.git
cd Dicionario_Estudos
```
### NPM Dependencies
```shell
npm install
```

### Environment Variables (`.env`)
Create `.env` file and:

| Variable                | Description                    | Example                                   |
| ----------------------- | ------------------------------ | ----------------------------------------- |
| `JWT_SECRET`            | JWTs signature key             | `secure_hash_here`                        |
| `DB_HOST`               | MySQL database host name       | `db` (default)                            |
| `DB_USER`               | MySQL database user name       | `root` (default)                          |
| `DB_PASSWORD`           | MySQL database password        | `secure_hash_here`                        |
| `DB_NAME`               | MySQL database scheme name     | `dictionary_admin`(Docker config default) |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary API Cloud name | `cloud_name_here`                         |
| `CLOUDINARY_API_KEY`    | Your Cloudinary API key        | `api_key_here`                            |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret     | `api_secret_here`                         |
> [Cloudinary API information](https://cloudinary.com/documentation/finding_your_credentials_tutorial)
### Docker Initialize
> Docker is highly recommended  to run this project without local dependency conflicts.
``` shell
docker compose up --build
```
### Database Dump
1. While container is up, Open `localhost:8081` to access **phpmyadmin** 
2. Use your credentials from  `.env` file (`DB_USER` and `DB_PASSWORD`)
3. Go to `import - File to import - browse...` 
4. Select `/dictionary_admin.sql` file and click at execute
### Verifying Initialize
- Access `localhost:8080` on your browser or HTTP client *(Postman/Insomnia)***