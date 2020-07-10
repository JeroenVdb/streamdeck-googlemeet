"use strict";
const SAFETY_DELAY = 100;
const DEBUG = true;
let websocketToStreamDeck;
let actionButtons = {};
class Bridge {
    constructor() {
        this.websocketToBridge = null;
        this.connect();
    }
    sendMessage(message) {
        var _a;
        debug(`Send message to bridge: ${JSON.stringify(message)}`);
        (_a = this.websocketToBridge) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(message));
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
function identifyAsPlugin() {
    bridge.sendMessage({
        type: 'identify',
        value: 'iamtheplugin',
    });
}
class Button {
    constructor(streamDeckAction, context) {
        this.streamDeckAction = streamDeckAction;
        this.context = context;
    }
    setState(state) {
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
function handleBridgeMessages(event) {
    debug(`Received message: ${event.data}`);
    const msg = JSON.parse(event.data);
    console.log(actionButtons);
    if (msg.type === 'muteState' && actionButtons['be.jeroenvdb.googlemeet.togglemute']) {
        setTimeout(() => {
            actionButtons['be.jeroenvdb.googlemeet.togglemute'].setState(msg.value === 'unmuted' ? 0 : 1);
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
            break;
    }
}
function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent) {
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
        return streamDeckActionToActionMap[streamDeckAction];
    }
}
function registerActionButton(streamDeckAction, context) {
    actionButtons[streamDeckAction] = new Button(streamDeckAction, context);
}
function debug(message) {
    if (DEBUG)
        console.log(message);
}
System.register("Bridge", [], function (exports_1, context_1) {
    "use strict";
    var Bridge;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            Bridge = class Bridge {
                constructor() {
                    this.websocketToBridge = null;
                    this.connect();
                }
                sendMessage(message) {
                    var _a;
                    debug(`Send message to bridge: ${JSON.stringify(message)}`);
                    (_a = this.websocketToBridge) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(message));
                }
                connect() {
                    if (this.websocketToBridge === null || this.websocketToBridge.readyState > 1) {
                        this.websocketToBridge = new WebSocket('ws://localhost:1987');
                        this.websocketToBridge.addEventListener('open', identifyAsPlugin);
                        this.websocketToBridge.addEventListener('message', handleBridgeMessages);
                    }
                }
            };
            exports_1("Bridge", Bridge);
        }
    };
});
//# sourceMappingURL=plugin.js.map