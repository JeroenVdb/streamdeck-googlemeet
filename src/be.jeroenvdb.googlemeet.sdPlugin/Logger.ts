export class Logger {
	enableDebugLogging: boolean;

	constructor(enableDebugLogging: boolean) {
		this.enableDebugLogging = enableDebugLogging;
	}

	debug(message: string) {
		if (this.enableDebugLogging) {
			this.log(message)
		}
	}

	log (message: string) {
		console.log(message);
	}
}
