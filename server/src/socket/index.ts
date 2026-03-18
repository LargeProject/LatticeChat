import type {Server as HttpServer} from "node:http";
import {Server as IOServer} from "socket.io";
import {PingPacket} from "./packets/serverbound/PingPacket";
import {ClientRequest} from "./services/types";
import {handlePing} from "./services/pingServices";

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