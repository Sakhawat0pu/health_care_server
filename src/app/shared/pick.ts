const pick = <T extends Record<string, unknown>, k extends keyof T>(
	query: T,
	keys: k[]
): Partial<T> => {
	const finalQuery: Partial<T> = {};

	for (const key of keys) {
		if (query && Object.hasOwnProperty.call(query, key)) {
			finalQuery[key] = query[key];
		}
	}

	return finalQuery;
};

export default pick;
