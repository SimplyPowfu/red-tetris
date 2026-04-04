## SERVER SCKET API

### Input
- Auth handshake: The socket identifies the user, during the handshake thee credentials must be provided. Onn socket disconnection the user is disconnected and deleted from the database.
Could fail for "Username already existing" or "Lobby in game"
- Lobby: Automatically joined after a successful handshake.
- Game: START/MOVE

### Output
- The client is considered logged and in a lobby after a successful handshake.
- The client will receive various actions, some may be the consequence of the player's action, others may be issued by the server. The client is expected to perform those action since the server state is update accordingly.
	Player consequences
	- OK: <move-type>
	- KO: <move-type>
	Server issued
	- NEWGRID
	- NEWBLOCK
	- PENALITY
	- GAMEOVER
	- TICK: <move-type>

MoveTypes: SHIFT_LEFT, SHIFT_RIGHT, SHIFT_DOWN, ROTATE, MEGA


### Self Handled
The client is expected to handle autonomously TOSTATIC and COLLAPSE actions after a successful MEGA or after a blocked SHIFT_DOWN