export class Bridge {
	websocketToBridge: WebSocket | null;

	constructor() {
		this.websocketToBridge = null;
		this.connect();
	}

	sendMessage(message: any) {
		debug(`Send message to bridge: ${JSON.stringify(message)}`);
		this.websocketToBridge?.send(JSON.stringify(message));
	}

	connect() {
		if (this.websocketToBridge === null || this.websocketToBridge.readyState > 1) {
			this.websocketToBridge = new WebSocket('ws://localhost:1987');

			this.websocketToBridge.addEventListener('open', identifyAsPlugin);
			this.websocketToBridge.addEventListener('message', handleBridgeMessages);
		}
	}

}
