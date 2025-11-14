import "dotenv/config"
import express from 'express'
import cors from 'cors'

const app = express()

const PORT = process.env.PORT 

//Middleware
app.use(cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.get("/", (req,res)=>{
    return res.send("Hello World!")
})

// Routes
import routes from './routes/index.js'

app.use (routes)

app.listen(PORT, ()=> console.log(`Server is running at PORT ${PORT}`))