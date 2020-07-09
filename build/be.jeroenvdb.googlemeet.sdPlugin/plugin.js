"use strict";
const SAFETY_DELAY = 100;
var websocketToExtensionBridge;
var websocketToPlugin;
openConnectionToBridge();
function identifyAsPlugin() {
    websocketToExtensionBridge.send(JSON.stringify({
        type: 'identify',
        value: 'iamtheplugin',
    }));
}
function handleIncommingMessages(event) {
    const msg = JSON.parse(event.data);
    if (msg.type === 'muteState' && actionButtons['be.jeroenvdb.googlemeet.togglemute']) {
        setTimeout(() => {
            setState(actionButtons['be.jeroenvdb.googlemeet.togglemute'].context, msg.value === 'unmuted' ? 0 : 1);
        }, SAFETY_DELAY);
    }
}
function openConnectionToBridge() {
    if (websocketToExtensionBridge === undefined || websocketToExtensionBridge.readyState > 1) {
        websocketToExtensionBridge = new WebSocket('ws://localhost:1987');
        websocketToExtensionBridge.addEventListener('open', identifyAsPlugin);
        websocketToExtensionBridge.addEventListener('message', handleIncommingMessages);
    }
}
function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent) {
    websocketToPlugin = new WebSocket('ws://127.0.0.1:' + inPort);
    websocketToPlugin.onopen = function () {
        registerPlugin(inPluginUUID);
    };
    websocketToPlugin.onmessage = function (evt) {
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
    };
    websocketToPlugin.onclose = function () {
    };
    function registerPlugin(inPluginUUID) {
        var json = {
            event: inRegisterEvent,
            uuid: inPluginUUID,
        };
        websocketToPlugin.send(JSON.stringify(json));
    }
}
function sendActionMessage(action) {
    websocketToExtensionBridge.send(JSON.stringify(createAction(action)));
}
function createAction(action) {
    return {
        type: 'action',
        value: streamDeckActionToActionMap[action],
    };
}
const actionButtons = {};
function registerActionButtons(context, action) {
    actionButtons[action] = {
        action: streamDeckActionToActionMap[action],
        context: context,
    };
}
const streamDeckActionToActionMap = {
    'be.jeroenvdb.googlemeet.mute': 'mute',
    'be.jeroenvdb.googlemeet.unmute': 'unmute',
    'be.jeroenvdb.googlemeet.togglemute': 'togglemute',
};
function setState(inContext, inState) {
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
//# sourceMappingURL=plugin.js.map