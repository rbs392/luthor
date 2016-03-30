"use strict"
var server 	= require('webserver').create() 
var system 	= require('system')
var handler = require('./handler')

function requestHandler(request, response){
	switch(request.method){
		case 'GET': handler.getRequestHandler(request, response)
		break;
		case 'POST': handler.postRequestHandler(request, response)
		break;
		default: handler.invalidRequestHandler(request, response)
	}
}

function init(){
	if(system.args.length!==2){
		console.log('Usage: server.js <some port>')
	    phantom.exit(1)
	}else{
		var port = system.args[1]

		var listening = server.listen(port, requestHandler)

		if(!listening){
			console.log("Could not create webserver on port "+port)
			phantom.exit()
		}
		console.log("Server started at port "+ port)
	}
}

//start here
module.exports = {
	"start" : init
}