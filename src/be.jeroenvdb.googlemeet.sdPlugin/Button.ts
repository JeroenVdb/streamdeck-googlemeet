export class Button {
	streamDeckAction: string;
	context: string;
	websocketToStreamDeck: WebSocket;

	constructor(streamDeckAction: string, context: string, websocketToStreamDeck: WebSocket) {
		this.streamDeckAction = streamDeckAction;
		this.context = context;
		this.websocketToStreamDeck = websocketToStreamDeck;
	}

	setState(state: number) {
		var json = {
			event: 'setState',
			context: this.context,
			payload: {
				state: state,
			},
		};

		this.websocketToStreamDeck.send(JSON.stringify(json));
	}
}
