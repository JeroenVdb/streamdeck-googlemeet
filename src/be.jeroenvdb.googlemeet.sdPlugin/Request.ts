export class Request {
	type: MessageType;
	value: RequestType;

	constructor(message: RequestType) {
		this.type = 'request';
		this.value = message;
	}
}

export type MessageType = 'request';
type RequestType = 'muteState';
