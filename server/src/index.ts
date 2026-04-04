import create from './server.js'
import params from './params.js'

const stop = create(params, () => {console.log('Happy things here')});

// setTimeout(() => stop(), 1000);