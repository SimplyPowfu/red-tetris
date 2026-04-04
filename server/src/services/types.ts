// export type Action = {
// 	type:string,
// 	payload?:any,
// }

// export type Query = {
// 	type:string,
// 	targets:string | string[],
// 	payload?:any,
// }

// export interface Service
// {
// 	/* actions that will change the state of the service */
// 	dispatch: (action:Action/* , next: (action?:Action) => void */) => boolean;
// 	/* get data from the state of the service */
// 	query: (query:Query) => number | any;
// }

import type { Socket } from 'socket.io';

// Event types
import type { ServerToClientEvents, ClientToServerEvents } from '@red/shared/types/Events'

export type EventSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
