const SAFETY_DELAY = 100;
const DEBUG = true;

let websocketToStreamDeck: WebSocket;

let actionButtons: ActionButtons = {};

class Bridge {
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

const bridge = new Bridge();
bridge.connect();

function identifyAsPlugin(): void {
	bridge.sendMessage({
		type: 'identify',
		value: 'iamtheplugin',
	});
}

class Button {
	streamDeckAction: string;
	context: string;

	constructor(streamDeckAction: string, context: string) {
		this.streamDeckAction = streamDeckAction;
		this.context = context;
	}

	setState(state: number) {
		if (websocketToStreamDeck) {
			var json = {
				event: 'setState',
				context: this.context,
				payload: {
					state: state,
				},
			};

			websocketToStreamDeck.send(JSON.stringify(json));
		}
	}
}

function handleBridgeMessages(event: MessageEvent) {
	debug(`Received message: ${event.data}`);
	const msg: MuteStateMessage = JSON.parse(event.data);
	console.log(actionButtons);
	if (msg.type === 'muteState' && actionButtons['be.jeroenvdb.googlemeet.togglemute']) {
		setTimeout(() => {
			actionButtons['be.jeroenvdb.googlemeet.togglemute'].setState(msg.value === 'unmuted' ? 0 : 1);
		}, SAFETY_DELAY);
	}
}

function handlePluginMessages(evt: MessageEvent) {
	const message = JSON.parse(evt.data);
	const event = message['event'];
	const action = message['action'];
	const context = message['context'];

	switch (event) {
		case 'keyDown':
			bridge.connect();
			bridge.sendMessage(new Action(action));
			break;
		case 'willAppear':
			bridge.connect();
			registerActionButton(action, context);
			break;
	}
}

function connectElgatoStreamDeckSocket(inPort: string, inPluginUUID: string, inRegisterEvent: string) {
	websocketToStreamDeck = new WebSocket('ws://127.0.0.1:' + inPort);

	websocketToStreamDeck.onopen = function () {
		registerPlugin(inPluginUUID);
	};

	websocketToStreamDeck.onmessage = handlePluginMessages;

	function registerPlugin(inPluginUUID: string) {
		var json = {
			event: inRegisterEvent,
			uuid: inPluginUUID,
		};

		websocketToStreamDeck.send(JSON.stringify(json));
	}
}

class Action {
	type: messageType;
	value: ActionType;

	constructor(streamDeckAction: StreamDeckActionType) {
		this.type = 'action';
		this.value = this.toAction(streamDeckAction);
	}

	toAction(streamDeckAction: StreamDeckActionType): ActionType {
		const streamDeckActionToActionMap: StreamDeckActionToActionMap = {
			'be.jeroenvdb.googlemeet.mute': 'mute',
			'be.jeroenvdb.googlemeet.unmute': 'unmute',
			'be.jeroenvdb.googlemeet.togglemute': 'togglemute',
		};

		return streamDeckActionToActionMap[streamDeckAction];
	}
}

function registerActionButton(streamDeckAction: string, context: string) {
	actionButtons[streamDeckAction] = new Button(streamDeckAction, context);
}



type StreamDeckActionType = 'be.jeroenvdb.googlemeet.mute' | 'be.jeroenvdb.googlemeet.unmute' | 'be.jeroenvdb.googlemeet.togglemute';
type ActionType = 'mute' | 'unmute' | 'togglemute';
type messageType = 'muteState' | 'action';

function debug(message: string) {
	if (DEBUG) console.log(message);
}

type MuteStateMessage = {
	type: messageType;
	value: 'muted' | 'unmuted';
};

type ActionButtons = {
	[index: string]: Button;
}

type StreamDeckActionToActionMap = {
	[index in StreamDeckActionType]: ActionType;
};
