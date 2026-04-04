import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { socket } from '@/services/socket';
import type { MapType } from "@red/shared/types/MapType";
import Piece from "@red/shared/classes/Piece";
import Board, { type BoardEvent } from '@red/shared/classes/Board';

import { newgrid } from '@red/shared/types/MapType';
import type { GameModeKey } from '@red/shared/types/GameMode';

interface State {
	mode: GameModeKey,
	grid: MapType,
	activePiece: Piece | null,
	nextPiece: Piece | null,
	score: number,
	gameover: boolean,
}

const initState = (): State => ({
	mode: 'basic',
	grid: newgrid('basic') as MapType,
	activePiece: null,
	nextPiece: null,
	score: 0,
	gameover: false,
});

export const useGameStore = defineStore('game', {
	// State from your Board class logic
	state: initState,
	actions: {
		// This function binds your "SocketDB" logic to the store
		initSocketListeners() {
			if (!socket) return;
	
			// debug
			socket.onAny((event) => {
				console.log(`Store saw event: ${event} | Current Score: ${this.score}`);
			});

			// clear on disconnect
			socket.on('disconnect', () => {
				this.$state = initState();
			});

			socket.on('lobbyMode', (data: { mode: GameModeKey }) => {
				this.gameover = false;
				this.mode = data.mode;
				this.grid = newgrid(this.mode);
			});

			// reset to default
			socket.on('matchStarted', () => {
				this.grid = newgrid(this.mode);
				this.score = 0;
				this.gameover = false;
			});

			socket.on('playerWin', () => {
				this.gameover = true;
			});

			// Sync with server/Board events
			socket.on('boardUpdate', (data: { grid: MapType, activePiece: Piece, gameover: boolean }) => {
				this.grid = data.grid;
				this.activePiece = data.activePiece;
				this.gameover = data.gameover;
			});

			socket.on('boardEvent', (data: { event:BoardEvent, payload?:any }) => {
				switch (data.event) {
					case 'newblock':
					{
						this.activePiece = this.nextPiece;
						this.nextPiece = new Piece(data.payload?.type);
						break ;
					}
					case 'penality':
					{
						Board.pn(this.grid, data.payload?.lines);
						break ;
					}
					case 'gameover':
					{
						this.gameover = true;
						break ;
					}
					case 'tick':
					{
						this.execMove(data.payload?.move);
						break ;
					}
				}
			});
		},
	
		execMove(__move:string) {
			console.log('Executing move', __move);
			const piece = this.activePiece as Piece | null; // why???
			switch(__move) {
				case 'Down':
					Board.sd(this.grid, piece);
					break ;
				case 'Left':
					Board.sl(this.grid, piece);
					break ;
				case 'Right':
					Board.sr(this.grid, piece);
					break ;
				case 'Rotate':
					Board.rr(this.grid, piece);
					break ;
				case 'Mega':
					Board.mf(this.grid, piece);
					break ;
				default:
					console.warn('Invalid move', __move);
			}
		},
		sendMove(__move:string) {
			if (!socket || this.gameover === true) return;
	
			console.log('[Game] Emitting \'move\'', __move);
			socket.emit('move', __move, (ok:boolean, score:number) => {
				if (ok === true) this.execMove(__move)
				this.score = score;
			});
		}
	
		/* function startGame() {
			socket?.emit('startGame');
		} */
	}
});