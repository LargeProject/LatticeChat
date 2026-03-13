import type {Server as HttpServer} from "node:http";
import {Server as IOServer} from "socket.io";
import {PingPacket} from "./packets/serverbound/PingPacket.js";
import {ClientRequest} from "./services/types.js";
import {handlePing} from "./services/pingServices.js";

const createIO = (server: HttpServer) => {
  const io = new IOServer(server);

  io.on("connection", (socket) => {

    socket.on('ping', (packet) => {
      const pingPacket = packet as PingPacket;
      handlePing(new ClientRequest(socket, pingPacket))
    });

    console.log("Client connected!");

  })

  return io;
}

export {createIO}