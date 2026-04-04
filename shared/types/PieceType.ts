export const BlockColor = {
	I: '#00E5FF',  // azzurro
	L: '#2962FF',  // blu
	J: '#FF9100',  // arancione
	O: '#FFD600',  // giallo
	S: '#00C853',  // verde
	Z: '#D50000',  // rosso
	T: '#AA00FF',  // viola
	X: '#535353',  // grigio 
	W: '#ffffff',  // bianco
	H: '#887777',  // grigio(shot)
	Error: '#fff', // bianco
};
  
export type PieceType = "Error" | "I" | "O" | "T" | "L" | "J" | "S" | "Z";

export type Shape = (keyof typeof BlockColor| null)[][];

// 'I', 'O', 'T', 'L', 'J', 'S', 'Z'
export const Tetriminos:Record<PieceType, Shape> = {
	I:[
		[null,null,null,null],
		['I', 'I', 'I', 'I'],
		[null,null,null,null],
		[null,null,null,null]
	],

	O:[
		[null,'O', 'O',null],
		[null,'O', 'O',null],
		[null,null,null,null]
	],

	T:[
		[null, 'T', null],
		['T', 'T', 'T'],
		[null,null,null]
	],

	L:[
		['L', null, null],
		['L', 'L', 'L'],
		[null,null,null]
	],

	J:[
		[null, null, 'J'],
		['J', 'J', 'J'],
		[null,null,null]
	],

	S:[
		[null, 'S', 'S'],
		['S', 'S', null],
		[null,null,null]
	],

	Z:[
		['Z', 'Z', null],
		[null, 'Z', 'Z'],
		[null,null,null]
	],
  
	Error: [
		['X', 'X', 'X'],
		['X', 'X', 'X'],
		['X', 'X', 'X']
	]
}