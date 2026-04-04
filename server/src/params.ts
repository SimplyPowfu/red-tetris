const params = {
	host: '0.0.0.0',
	port: Number(process.env.PORT ?? 3000),
}

export type ServerParams = {
	host: string,
	port: number,
}

export default params