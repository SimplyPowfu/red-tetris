// This is a middleware factory
// getState supplied by Redux on creation, 'next' and 'action' supplied
// when the produced function gets called
const storeStateMiddleware = ({ getState }) => {
	return (next) => (action) => {
		let returnValue = next(action);
		window.top.state = getState();
		return returnValue;
	}
}

export default storeStateMiddleware;
