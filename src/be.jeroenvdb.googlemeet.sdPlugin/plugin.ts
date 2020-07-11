
import { Button } from './Button';
import { Bridge } from './Bridge';
import { debug } from './logging';
import { Action, MessageType } from './Action';

const SAFETY_DELAY = 100;
let websocketToStreamDeck: WebSocket;
let buttons: Buttons = {};

const bridge = new Bridge('iamtheplugin', handleBridgeMessages);

// @ts-ignore
window.connectElgatoStreamDeckSocket = function connectElgatoStreamDeckSocket(inPort: string, inPluginUUID: string, inRegisterEvent: string) {
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

function handleBridgeMessages(event: MessageEvent) {
	debug(`Received message: ${event.data}`);
	const msg: MuteStateMessage = JSON.parse(event.data);
	if (msg.type === 'muteState' && buttons['be.jeroenvdb.googlemeet.togglemute']) {
		setTimeout(() => {
			buttons['be.jeroenvdb.googlemeet.togglemute'].setState(msg.value === 'unmuted' ? 0 : 1);
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

function registerActionButton(streamDeckAction: string, context: string) {
	buttons[streamDeckAction] = new Button(streamDeckAction, context, websocketToStreamDeck);
}

type MuteStateMessage = {
	type: MessageType;
	value: 'muted' | 'unmuted';
};

type Buttons = {
	[index: string]: Button;
}


