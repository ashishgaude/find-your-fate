const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = process.env.PORT || 3000;


let clients = {};

wss.on("connection", (ws) => {
    ws.on("message", (message) => {
        console.log("connected clients", JSON.stringify(clients))
        const data = JSON.parse(message);

        switch (data.type) {
            case "register":
                clients[data.name] = ws;
                break;
            case "call":
                if (clients[data.target]) {
                    clients[data.target].send(JSON.stringify({ type: "offer", offer: data.offer, caller: data.caller }));
                }
                break;
            case "answer":
                if (clients[data.target]) {
                    clients[data.target].send(JSON.stringify({ type: "answer", answer: data.answer }));
                }
                break;
            case "candidate":
                if (clients[data.target]) {
                    clients[data.target].send(JSON.stringify({ type: "candidate", candidate: data.candidate }));
                }
                break;
        }
    });

    ws.on("close", () => {
        Object.keys(clients).forEach((name) => {
            if (clients[name] === ws) delete clients[name];
        });
    });
});

server.listen(port, () => console.log("Server running on port", port));
