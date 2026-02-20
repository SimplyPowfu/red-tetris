// Utils import
import DispatchQueue from '../classes/Queue';

const dispatchFromQ = store => next => action => {
	const result = next(action);

	let actionQ = undefined;

	do
	{
		actionQ = DispatchQueue.pop();
		if (actionQ) {
			console.log(`[DISPATCHER] dispatching ${actionQ.payload.type} from ${action.origin}`)
			store.dispatch(actionQ.payload);
		}
	}
	while (actionQ !== undefined)

	return result;
}

export default dispatchFromQ;