const io = require ("socket.io");
const { ConsoleLogger } = require ("./core");
const { ChatService } = require ("./services");

class SocketServer {
	_io;

	constructor (server) {
		this._io = io (server, {
			cors: this.buildCorsOptWs (),
		});
		this.initial ();
	}

	buildCorsOptWs() {
		return {
			origin: "*", // Allow all origins and ports
			credentials: true, // Allow credentials if needed
		};
	}
	

	initial () {
		this._io.on ("connection", (socket) => {

			socket.on ('auth_user', async (userId) => {
				socket._userId = userId;
				const data = await ChatService.getRoomsWithUser (userId);
				socket.emit ("get_rooms", data);
			});


			socket.on ("create_room", async (room) => {
				const roomInfo = {
					name: room.name,
					avatarUrl: room.avatarUrl,
					lastMessage: room.lastMessage,
					author: socket._userId
				};
				await ChatService.validateCreateRoom (roomInfo);
			});
			socket.on ("disconnect", (reason) => {
				ConsoleLogger.warn (`disconnect ${socket.id} due to ${reason}`);

				this._io.emit ("user_disconnected", "user_disconnected");
			});
		});
	}

}

module.exports = SocketServer;
