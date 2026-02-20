export const CHECK_QUEUE = 'queue/check';

export function queuecheck() {
	return ({
		type: CHECK_QUEUE
	});
}