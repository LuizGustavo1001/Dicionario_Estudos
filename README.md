# Dicionario_Estudos

## Technologies 
- [Docker Compose](https://docs.docker.com/compose/)
- [Node.JS](https://nodejs.org)
- [MySQL](https://www.mysql.com/)
- [NPM](https://www.npmjs.com/)
- [JWT](https://www.jwt.io/)

### Run Project
#### NPM dependencies
1. At project root, run at a terminal:
```shell
npm init -y
npm install express
npm install mysql2
npm install cors
npm install dotenv
npm install bcrypt
npm install sass
npm install cookie-parser
npm install jsonwebtoken
npm install crypto
npm install cloudinary
npm install html-to-image
```
#### Docker Compose
1. After installing *NPM dependencies*, at project root again:
```shell
docker compose up --build
```
2. If its not your first time opening the container:
```shell
docker compose up
```
#### Database
1. Open `localhost:8081`
	- User: root
	- Password: root
2. Go to `import - File to import - browse...` and select `/dictionary_admin.sql` file

> [!note]- Example users
> 1. user_0001
> 	- username: user_0001
> 	- mail: exemplo@dominio.com
> 	- password: 1901

#### Others
1. To setup `JWT_SECRET`, go to `/.env` and overwrite `<TOKEN_HERE>` to your JWT secret token
```env
JWT_SECRET=<TOKEN_HERE>
```

2. If you want to change database user or password, go to `.env` and overwrite `<DB_USER>` or `<DB_PASSWORD>`
```env
DB_USER=root
DB_PASSWORD=root
```


