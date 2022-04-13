(function () {
	'use strict';

	class Button {
	    constructor(streamDeckAction, context, websocketToStreamDeck) {
	        this.streamDeckAction = streamDeckAction;
	        this.context = context;
	        this.websocketToStreamDeck = websocketToStreamDeck;
	    }
	    setState(state) {
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

	class Logger {
	    constructor(enableDebugLogging) {
	        this.enableDebugLogging = enableDebugLogging;
	    }
	    debug(message) {
	        if (this.enableDebugLogging) {
	            this.log(message);
	        }
	    }
	    log(message) {
	        console.log(message);
	    }
	}

	const logger = new Logger(true);
	class Bridge {
	    constructor(identity, messageHandler) {
	        this.websocketToBridge = null;
	        this.identity = identity;
	        this.messageHandler = messageHandler;
	        this.connect();
	    }
	    sendMessage(message) {
	        logger.debug(`Send message to bridge: ${JSON.stringify(message)}`);
	        if (this.websocketToBridge) {
	            this.websocketToBridge.send(JSON.stringify(message));
	        }
	    }
	    connect() {
	        if (this.websocketToBridge === null || this.websocketToBridge.readyState > 1) {
	            this.websocketToBridge = new WebSocket('ws://localhost:1987');
	            this.websocketToBridge.addEventListener('open', () => { this.identify(); });
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

	class Action {
	    constructor(streamDeckAction) {
	        this.type = 'action';
	        this.value = this.toAction(streamDeckAction);
	    }
	    toAction(streamDeckAction) {
	        const streamDeckActionToActionMap = {
	            'be.jeroenvdb.googlemeet.mute': 'mute',
	            'be.jeroenvdb.googlemeet.unmute': 'unmute',
	            'be.jeroenvdb.googlemeet.togglemute': 'togglemute',
	        };
	        if (!streamDeckActionToActionMap[streamDeckAction]) {
	            throw new Error(`Unsupported action: "${streamDeckAction}"`);
	        }
	        return streamDeckActionToActionMap[streamDeckAction];
	    }
	}

	class Request {
	    constructor(message) {
	        this.type = 'request';
	        this.value = message;
	    }
	}

	const SAFETY_DELAY = 100;
	let websocketToStreamDeck;
	let buttons = {};
	const logger$1 = new Logger(true);
	const bridge = new Bridge('iamtheplugin', handleBridgeMessages);
	window.connectElgatoStreamDeckSocket = function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent) {
	    websocketToStreamDeck = new WebSocket('ws://127.0.0.1:' + inPort);
	    websocketToStreamDeck.onopen = function () {
	        registerPlugin(inPluginUUID);
	    };
	    websocketToStreamDeck.onmessage = handlePluginMessages;
	    function registerPlugin(inPluginUUID) {
	        var json = {
	            event: inRegisterEvent,
	            uuid: inPluginUUID,
	        };
	        websocketToStreamDeck.send(JSON.stringify(json));
	    }
	};
	function handleBridgeMessages(event) {
	    logger$1.debug(`Received message: ${event.data}`);
	    const msg = JSON.parse(event.data);
	    if (msg.type === 'muteState' && buttons['be.jeroenvdb.googlemeet.togglemute']) {
	        setTimeout(() => {
	            buttons['be.jeroenvdb.googlemeet.togglemute'].setState(msg.value === 'unmuted' ? 0 : 1);
	        }, SAFETY_DELAY);
	    }
	}
	function handlePluginMessages(evt) {
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
	            bridge.sendMessage(new Request('muteState'));
	            break;
	    }
	}
	function registerActionButton(streamDeckAction, context) {
	    buttons[streamDeckAction] = new Button(streamDeckAction, context, websocketToStreamDeck);
	}

}());
