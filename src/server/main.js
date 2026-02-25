import params  from '../../params.js'
import * as server from './index.js'
server.create(params.server).then( () => console.log('ready to play tetris with U :)') )
