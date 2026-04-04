export type GameAction = "Down" | "Left" | "Right" | "Rotate" | "Shot";

export type LoopSchedule = {
	tickMs: number;
	[step: number]: GameAction;
};

export type GameMode = {
	loopSchedule: LoopSchedule;
	startGrid: string;
};

// Example
export const modes = {
	basic: {
		loopSchedule: {
			tickMs: 100,
			9: "Down",
		},
		startGrid: "basic",
	},
	ghost: {
		loopSchedule: {
		tickMs: 100,
			8: "Rotate",
			9: "Down",
		},
		startGrid: "ghost",
	},
	invaders: {
		loopSchedule: {
		tickMs: 100,
			4: "Shot",
			9: "Down",
		},
		startGrid: "invaders",
	},
	wiggly: {
		loopSchedule: {
		tickMs: 50,
			2: "Left",
			4: "Down",
			7: "Right",
			9: "Down",
		},
		startGrid: "wiggly",
	},
} as const satisfies Record<string, GameMode>;

export type GameModeKey = keyof typeof modes;

export default modes;