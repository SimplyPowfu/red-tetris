
export class SocketHub
{
	_sockets = new Map();
	_errors = [];

	set(__ID, __socket)
	{
		if (this._sockets.has(__ID))
		{
			this._errors.push({
				code: 1,
				message: `Socket '${__ID}' already present`
			});
		}
		else
		{
			this._sockets.set(__ID, {
				socket: __socket,
				auth: null,
			});
		}
	}

	delete(__ID)
	{
		if (!this._sockets.has(__ID))
		{
			this._errors.push({
				code: 2,
				message: `Socket '${__ID}' not present`
			});
		}
		else
		{
			this._sockets.delete(__ID);
		}
	}

	auth(__ID, __auth)
	{
		// console.log('[SocketHub] auth', __auth);
		const socket = this._sockets.get(__ID);
		if (socket === undefined)
		{
			this._errors.push({
				code: 2,
				message: `Socket '${__ID}' not present`
			});
		}
		else
		{
			socket.auth = { ...__auth, id:__ID};
			// console.log('[SocketHub] auth ok', this._sockets);
		}
	}

	/* Send to specific Id */
	send(__ID, __message)
	{
		const socket = this._sockets.get(__ID);
		if (socket === undefined)
		{
			this._errors.push({
				code: 2,
				message: `Socket '${__ID}' not present`
			});
		}
		else
		{
			socket.socket.send(__message);
		}
	}

	emit(__ID, __eventName, __event)
	{
		const socket = this._sockets.get(__ID);
		if (socket === undefined)
		{
			this._errors.push({
				code: 2,
				message: `Socket '${__ID}' not present`
			});
		}
		else
		{
			socket.socket.emit(__eventName, __event);
		}
	}

	/* Send to payloadcheck */
	emitTo(check, __eventName, __event)
	{
		const target = [...this._sockets.values()].filter(socket => socket.auth && check(socket.auth));
		// console.log('[SocketHub] emitTo', target);
		target.forEach(t => t.socket.emit(__eventName, __event))
	}

	/* read errors */
	error()
	{
		return this._errors.pop();
	}
}

const SHub = new SocketHub();

export default SHub;