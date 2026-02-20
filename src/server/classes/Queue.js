// Server imports
import { store } from '../store';
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
				store.dispatch(queuecheck());
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