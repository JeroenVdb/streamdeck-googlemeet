import { Logger } from './Logger';

const logger = new Logger(true);

export class Bridge {
	websocketToBridge: WebSocket | null;
	identity: IdentityType;
	messageHandler: any;

	constructor(identity: IdentityType, messageHandler: any) {
		this.websocketToBridge = null;
		this.identity = identity;
		this.messageHandler = messageHandler;
		this.connect();
	}

	sendMessage(message: any) {
		logger.debug(`Send message to bridge: ${JSON.stringify(message)}`);
		if (this.websocketToBridge) {
			this.websocketToBridge.send(JSON.stringify(message));
		}
	}

	connect() {
		if (this.websocketToBridge === null || this.websocketToBridge.readyState > 1) {
			this.websocketToBridge = new WebSocket('ws://localhost:1987');

			this.websocketToBridge.addEventListener('open', () => { this.identify() });
			this.websocketToBridge.addEventListener('message', this.messageHandler);
		}
	}

	identify() {
		this.sendMessage({
			type: 'identify',
			value: this.identity,
		});
	}

}

type IdentityType = 'iamtheplugin';
