import 'src/db'
import 'express-async-errors'
import "dotenv/config"
import express, { RequestHandler } from 'express';
import authRouter from 'routes/auth';

const app = express();

app.use(express.static("src/public"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

//API Routes
app.use("/auth", authRouter)

app.use(function (err, req, res, next) {
    res.status(500).json({ message: err.message })
} as express.ErrorRequestHandler)

app.post("/", (req, res) => {
    res.send("Hello World");
});

app.listen(8000, () => {
    console.log("Server is running on port http://localhost:8000");
});