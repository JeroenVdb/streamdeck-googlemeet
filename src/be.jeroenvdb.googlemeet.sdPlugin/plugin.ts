const SAFETY_DELAY = 100;

var websocketToExtensionBridge: WebSocket;
var websocketToPlugin: WebSocket;

openConnectionToBridge();

function identifyAsPlugin() {
	websocketToExtensionBridge.send(
		JSON.stringify({
			type: 'identify',
			value: 'iamtheplugin',
		})
	);
}

function handleExtensionMessages(event: MessageEvent) {
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
			sendActionMessage(action);
			break;
		case 'willAppear':
			openConnectionToBridge();
			registerActionButtons(context, action);
			break;
	}
}

function openConnectionToBridge() {
	if (websocketToExtensionBridge === undefined || websocketToExtensionBridge.readyState > 1) {
		websocketToExtensionBridge = new WebSocket('ws://localhost:1987');

		websocketToExtensionBridge.addEventListener('open', identifyAsPlugin);
		websocketToExtensionBridge.addEventListener('message', handleExtensionMessages);
	}
}

function connectElgatoStreamDeckSocket(inPort: string, inPluginUUID: string, inRegisterEvent: string) {
	websocketToPlugin = new WebSocket('ws://127.0.0.1:' + inPort);

	websocketToPlugin.onopen = function () {
		registerPlugin(inPluginUUID);
	};

	websocketToPlugin.onmessage = handlePluginMessages;

	function registerPlugin(inPluginUUID: string) {
		var json = {
			event: inRegisterEvent,
			uuid: inPluginUUID,
		};

		websocketToPlugin.send(JSON.stringify(json));
	}
}

function sendActionMessage(action: string) {
	websocketToExtensionBridge.send(JSON.stringify(createAction(action)));
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
	if (websocketToPlugin) {
		var json = {
			event: 'setState',
			context: inContext,
			payload: {
				state: inState,
			},
		};

		websocketToPlugin.send(JSON.stringify(json));
	}
}

type muteStateMessage = {
	type: 'muteState';
	value: 'muted' | 'unmuted';
};
