// Utils import
import DispatchQueue from '../classes/Queue';

const dispatchFromQ = store => next => action => {
	const result = next(action);

	let queued = undefined;

	do
	{
		queued = DispatchQueue.pop();
		if (queued) {
			console.log(`[DISPATCHER] dispatching ${queued.payload.type} from ${queued.origin}`)
			store.dispatch(queued.payload);
		}
	}
	while (queued !== undefined)

	return result;
}

export default dispatchFromQ;