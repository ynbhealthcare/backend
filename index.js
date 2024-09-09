import express from "express";
import cors from "cors";
import morgan from "morgan";
import colors from "colors";
import dotenv from "dotenv";
import connection from "./database/db.js";
import Router from "./routes/routes.js";
import path from "path";
const app = express();
import http from "http";
import { Server } from "socket.io";
import messageModel from "./models/messageModel.js";
import bodyParser from "body-parser";

app.use(cors());


// const allowedOrigins = ['https://cayroshop.com/', 'https://test.ccavenue.com', 'https://secure.ccavenue.com'];

// // Configure CORS with the allowed origins
// app.use(cors({
//   origin: function (origin, callback) {
//     // Check if the origin is in the allowed origins array
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// }));


app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use(morgan("dev"));
app.use(express.static("public"));
app.use("/", Router);



dotenv.config();

// socket io

const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://lead.delhiexpert.com", "https://ynb.taxonomy.co.in", "https://ynbadmin.taxonomy.co.in"],
    methods: ["GET", "POST"], // Allow only GET and POST methods
  },
}); // Create a new instance of Socket.io Server and pass the HTTP server to it

// Socket.io events
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // Example: Handle chat message event
  socket.on("chat message", (msg) => {
    console.log("message: " + msg);
    // Broadcast the message to all connected clients
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});


app.get('/', (req, res) => {
  res.send('You are not authorized for this action');
});

const PORT = 3050;
server.listen(PORT, () =>
  console.log(`server is runnning ${PORT}`.bgCyan.white)
);

const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;

const DBURL = process.env.URL;

connection(username, password, DBURL);
