"use strict"
var server 	= require('webserver').create() 
var system 	= require('system')
var process = require('child_process')
var spawn 	= process.spawn


var fetchTimeout 	= 4

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

function requestHandler(request, response){
	switch(request.method){
		case 'GET': getRequestHandler(request, response)
		break;
		case 'POST': postRequestHandler(request, response)
		break;
		default: invalidRequestHandler(request, response)
	}
}

function postRequestHandler(request, response){
	var params = formatQueryParams(request.url)
	if(!params.url){
		response.statusCode = 500
		response.write("Invalid url query param")
		response.close()
	}else if(!request.post){
		response.statusCode = 500
		response.write("Invalid post body - HTML required ")
		response.close()
	}else{
		execWorker("post", params.url, request.post)
		// page.onResourceRequested 	= onResourceRequested
		// page.onResourceReceived 	= onResourceReceived
		// page.onResourceError 		= onResourceError.bind(this, response)
		// pageHandler(params.url, request, response, true)
	}
}

function getRequestHandler(request, response){
	var params = formatQueryParams(request.url)
	if(!params.url){
		response.statusCode = 500
		response.write("Invalid url query param")
		response.close()
	}else{
		execWorker("get", params.url)
	}

}

function invalidRequestHandler(request, response){
	response.statusCode = 500
	response.write("Invalid operation use GET or POST method")
	response.close()
}

function formatQueryParams(params){
	var result = {}
	var queryRegex = /\/\w*\?url=(.*)/
	result.url = params.match(queryRegex)?params.match(queryRegex)[1]:""
	return result
}

function execWorker(type, url, data){
	var successdata = ""
	var errordata 	= ""
	var child 		= spawn('phantomjs', ["worker.js", type, url, data])

	child.stdout.on("data", function(request, response, data){
		console.log(data)
		response.statusCode = 200
		response.write(data)
		response.close()
	}.bind(this, request, response))

	child.stderr.on("data", function(request, response, data){
		console.log(data)
		response.statusCode =500
		response.write(data)
		response.close()
	}.bind(this, request, response))
	// child.kill('SIGKILL')
	child.on('exit', function(request, response, code){
		console.log("exit triggered =================================?>>>>>>>>>>>>>>>")
		
	})

}