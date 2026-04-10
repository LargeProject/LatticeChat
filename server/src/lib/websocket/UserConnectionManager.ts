import type { SocketWithAuth } from './types';

export class UserConnectionManager {
  private userSocketMap: Map<string, Set<string>> = new Map();

  addSocket(userId: string, socketId: string) {
    if (!this.userSocketMap.has(userId)) {
      this.userSocketMap.set(userId, new Set());
    }
    this.userSocketMap.get(userId)!.add(socketId);
  }

  removeSocket(userId: string, socketId: string) {
    const sockets = this.userSocketMap.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userSocketMap.delete(userId);
      }
    }
  }

  getUserSockets(userId: string): Set<string> | undefined {
    return this.userSocketMap.get(userId);
  }

  isUserOnline(userId: string): boolean {
    return this.userSocketMap.has(userId);
  }

  getUserIds(): string[] {
    return Array.from(this.userSocketMap.keys());
  }

  disconnect(socket: SocketWithAuth) {
    const userId = socket.data.userId;
    if (userId) {
      this.removeSocket(userId, socket.id);
    }
  }
}
