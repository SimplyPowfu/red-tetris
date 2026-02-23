
const START_COLUMN = 3

export const BlockColor = {
  I: '#00E5FF', // azzurro
  L: '#2962FF', // blu
  J: '#FF9100', // arancione
  O: '#FFD600', // giallo
  S: '#00C853', // verde
  Z: '#D50000', // rosso
  T: '#AA00FF', // viola
  X: '#535353', // grigio 
  W: '#ffffff', // bianco
  H: '#887777', // grigio(shot)
};

// 'I', 'O', 'T', 'L', 'J', 'S', 'Z'
export const Tetriminos = {
  I:[
	[null,null,null,null],
	['I', 'I', 'I', 'I'],
	[null,null,null,null],
	[null,null,null,null]],

  O:[
	[null,'O', 'O',null],
	[null,'O', 'O',null],
	[null,null,null,null]],

  T:[
	[null, 'T', null],
	['T', 'T', 'T'],
	[null,null,null]],

  L:[
	['L', null, null],
	['L', 'L', 'L'],
	[null,null,null]],

  J:[
	[null, null, 'J'],
	['J', 'J', 'J'],
	[null,null,null]],

  S:[
	[null, 'S', 'S'],
	['S', 'S', null],
	[null,null,null]],

  Z:[
	['Z', 'Z', null],
	[null, 'Z', 'Z'],
	[null,null,null]]
}

export default class Piece
{
	shape = [];
	row = 0;
	column= START_COLUMN;
	_type = 'Error';
	_parent = null;

	constructor(__blockType, __parent) {
		if (!Tetriminos[__blockType])
			__blockType = 'I';

		this.shape = Tetriminos[__blockType];
		this._type = __blockType;
		this._parent = __parent;
	}

	/* get shape() {
		return this._shape;
	} */

	get type() {
		return this._type;
	}
}