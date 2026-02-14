// block actions if not to reduce
const blockReduce = store => next => action => {

	// check for dont-reduce flag
	if ((action.meta && action.meta.doNotReduce))
		return ;

	return next(action);
}

export default blockReduce;