// Server imports
import { store } from './store';
import { queuecheck } from '../actions/monitor';

class Queue
{
	_queue = [];
	_timeout = null;

	push(__payload, __origin) {
		this._queue.push({
			payload: __payload,
			origin: __origin
		});

		// update the store
		if (this._timeout === null)
		{
			this._timeout = setTimeout(() => {
				
				// Dispatch all queued actions
				let queued = undefined;

				do
				{
					queued = this.pop();
					if (queued) {
						console.log(`[DISPATCHER] dispatching ${queued.payload.type} from ${queued.origin}`)
						store.dispatch(queued.payload);
					}
				}
				while (queued !== undefined)

				// reset timeout
				this._timeout = null;
			}, 0);
		}
	}

	pop() {
		return this._queue.pop();
	}
}


const q = new Queue();

export default q;