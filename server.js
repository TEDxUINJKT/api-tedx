const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const fileUpload = require('express-fileupload')

const routes = require('./src/routes/index')

const app = express();

const dbConnection = require('./src/config/db.js')
const config = require('./src/config/env.js')
const path = require('path')

// setup configuration
const { PORT, MONGO_URL } = config

//middleware
app.use('/public', express.static(path.join(__dirname, '/public')))

//enable cors
app.use(cors({
    credentials: true,
    // origin: "*"
    origin: ['https://tedxuinjakarta.com','https://dashboard.tedxuinjakarta.com','https://tedxuinjakarta.vercel.app','https://dashboard-tedxuinjakarta.vercel.app','https://api.tedxuinjakarta.com','http://localhost:8000','http://localhost:3000','http://localhost:3001']
    // origin: ['https://tedxuinjakarta.com','https://www.tedxuinjakarta.com', 'https://dashboard.tedxuinjakarta.com', 'https://tedxuinjakarta.vercel.app', 'http://localhost:3000', 'http://localhost:3001','https://dashboard-tedxuinjakarta.vercel.app']
}))

app.use(helmet());

//allow to access cookie
app.use(cookieParser());

//allow request with format x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

//allow request with format json
app.use(bodyParser.json())

//file uploader handler
app.use(fileUpload({
    uploadTimeout: 60000
}))

app.use(routes);

dbConnection(MONGO_URL)
app.listen(PORT, () => console.log(`server running on port ${PORT}`))
