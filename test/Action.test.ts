import { Action } from '../src/be.jeroenvdb.googlemeet.sdPlugin/Action';
import { strictEqual, throws } from 'assert';

describe('Action', function () {
	it('should return proper Action object', function () {
		var action = new Action('be.jeroenvdb.googlemeet.togglemute');
		strictEqual(action.type, 'action');
		strictEqual(action.value, 'togglemute');
	});

	it('should throw when action is not supported', function () {
		throws(() => {
			// @ts-ignore
			new Action('be.jeroenvdb.googlemeet.foobar');
		}, Error);
	});
});
