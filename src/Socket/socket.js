import io from "socket.io-client";

let socket = io.connect("http://localhost:7070");

console.log(socket);
// socket.disconnect();
