export class Action {
	type: MessageType;
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

type StreamDeckActionToActionMap = {
	[index in StreamDeckActionType]: ActionType;
};

type StreamDeckActionType = 'be.jeroenvdb.googlemeet.mute' | 'be.jeroenvdb.googlemeet.unmute' | 'be.jeroenvdb.googlemeet.togglemute';
type ActionType = 'mute' | 'unmute' | 'togglemute';
export type MessageType = 'muteState' | 'action';
