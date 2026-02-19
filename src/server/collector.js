
const collection = {};
const subs = {};

export function map()
{
	return {
		collection,
		subs,
	}
}

export function set(itemKey, item)
{
	if (!itemKey)
		return ;
	collection[itemKey] = item;
}

export function getKey(itemKey)
{
	if (!itemKey)
		return undefined;
	return collection[itemKey];
}

export function push(itemKey, itemValue)
{
	if (!itemKey)
		return ;

	if (!collection[itemKey]) {
		collection[itemKey] = [];
	}

	collection[itemKey].push(itemValue);
}

export function subscribe(itemKey, subKey)
{
	if (!itemKey || !subKey)
		return ;

	if (!subs[subKey]) {
		subs[subKey] = new Set();
	}
	subs[subKey].add(itemKey);
}


export function getSub(subKey)
{
	if (!subKey)
		return undefined;
	return subs[subKey] ? Array.from(subs[subKey]) : undefined;
}

export function delKey(itemKey, cb = () => {})
{
	if (!itemKey || !collection[itemKey]) return;

	cb(collection[itemKey]);

	delete collection[itemKey];

	for (const [key, value] of Object.entries(subs)) {
		value.delete(itemKey);

		if (value.size === 0) {
			delete subs[key];
		}
	}
}

export function delSub(subKey, cb = () => {})
{
	if (!subKey || !subs[subKey])
		return ;

	// remove from subscription
	for (const key of subs[subKey]) {
		if (!collection[key]) continue ;
		cb(collection[key]);
		delete collection[key];
	}
	delete subs[subKey];
}

export default { map, set, push, subscribe, getKey, getSub, delKey, delSub };

