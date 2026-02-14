// block acctions if not to reduce
const blockReduce = store => next => action => {

	// check for auth data
	if ((action.meta && action.meta.doNotReduce))
		return ;

	return next(action);
}

export default blockReduce;