import chai from "chai"

// Server imports
import {startServer, configureStore} from '../helpers/server.js'
import io from 'socket.io-client'
import params from '../../params.js'

chai.should()

describe('File Serve', function(){
	
	// start server
	let tetrisServer
	before(cb => startServer( params.server, function(err, server){
		tetrisServer = server
		cb()
	}))

	after(function(done){tetrisServer.stop(done)})

	it('index.html', function(done) {

		fetch(params.server.url)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response
			})
			.then((result) => {
				// sort descending by score
				result.body.should.exist
				done()
			})
			.catch((err) => done(new Error("Error while fetching index.html", err)));		
	})

	it('bundle.js', function(done) {

		fetch(params.server.url)
		.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response
			})
			.then((result) => {
				// sort descending by score
				result.body.should.exist
				done()
			})
			.catch((err) => done(new Error("Error while fetching index.html", err)));		
	})

	it('leaderboard', function(done) {

		fetch(`${params.server.url}/leaderboard`)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response
			})
			.then((result) => {
				// sort descending by score
				result.body.should.exist
				done()
			})
			.catch((err) => done(new Error("Error while fetching index.html", err)));		
	})
})