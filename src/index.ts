import 'src/db'
import 'express-async-errors'
import "dotenv/config"
import express, { RequestHandler } from 'express';
import authRouter from 'routes/auth';
import path from 'path';

const app = express();

app.use(express.static("src/public"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

//API Routes
app.use("/auth", authRouter)

app.use(function (err, req, res, next) {
    res.status(500).json({ message: err.message })
} as express.ErrorRequestHandler)

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'my-page.html'));
});

app.listen(5000, () => {
});