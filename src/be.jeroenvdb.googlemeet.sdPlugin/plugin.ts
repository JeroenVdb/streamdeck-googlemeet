const SAFETY_DELAY = 100;

var websocketToBridge: WebSocket;
var websocketToStreamDeck: WebSocket;

openConnectionToBridge();

function identifyAsPlugin(): void {
	websocketToBridge.send(
		JSON.stringify({
			type: 'identify',
			value: 'iamtheplugin',
		})
	);
}

function handleBridgeMessages(event: MessageEvent) {
	const msg: muteStateMessage = JSON.parse(event.data);
	if (msg.type === 'muteState' && actionButtons['be.jeroenvdb.googlemeet.togglemute']) {
		setTimeout(() => {
			setState(actionButtons['be.jeroenvdb.googlemeet.togglemute'].context, msg.value === 'unmuted' ? 0 : 1);
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
			openConnectionToBridge();
			sendActionMessage(action);
			break;
		case 'willAppear':
			openConnectionToBridge();
			registerActionButtons(context, action);
			break;
	}
}

function openConnectionToBridge() {
	if (websocketToBridge === undefined || websocketToBridge.readyState > 1) {
		websocketToBridge = new WebSocket('ws://localhost:1987');

		websocketToBridge.addEventListener('open', identifyAsPlugin);
		websocketToBridge.addEventListener('message', handleBridgeMessages);
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

function sendActionMessage(action: string) {
	websocketToBridge.send(JSON.stringify(createAction(action)));
}

function createAction(action: string) {
	return {
		type: 'action',
		value: streamDeckActionToActionMap[action],
	};
}

const actionButtons: any = {};

function registerActionButtons(context: string, action: string) {
	actionButtons[action] = {
		action: streamDeckActionToActionMap[action],
		context: context,
	};
}

const streamDeckActionToActionMap: any = {
	'be.jeroenvdb.googlemeet.mute': 'mute',
	'be.jeroenvdb.googlemeet.unmute': 'unmute',
	'be.jeroenvdb.googlemeet.togglemute': 'togglemute',
};

function setState(inContext: string, inState: number) {
	if (websocketToStreamDeck) {
		var json = {
			event: 'setState',
			context: inContext,
			payload: {
				state: inState,
			},
		};

		websocketToStreamDeck.send(JSON.stringify(json));
	}
}

type muteStateMessage = {
	type: 'muteState';
	value: 'muted' | 'unmuted';
};
