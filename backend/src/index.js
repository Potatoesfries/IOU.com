import express from "express"
import dotenv from "dotenv"
import noteRoutes from "./routes/notes.route.js" 
import authRoutes from "./routes/auth.route.js"
import { connectDb } from "./lib/db.js"
import cors from "cors"
import path from "path"

const app = express()


dotenv.config()

const port = process.env.PORT   

app.use(cors(
    {
        origin: "http://localhost:5173"
    }
))

const __dirname = path.resolve();

// middleware to set data into the body of the request
app.use(express.json())


// Add this line with your other routes 
app.use("/api/auth", authRoutes)
app.use("/api/debt-notes", noteRoutes)

if(process.env.NODE_ENV === "production"){
        const frontendDist = path.join(__dirname, "../frontend/dist");
        app.use(express.static(frontendDist));
        app.get("*", (req, res) => {
            res.sendFile(path.join(frontendDist, "index.html"));
        });
    }


app.listen(port, ()=>{
    console.log("Server is running on port", port)
    connectDb()
})