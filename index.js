"use strict"
var server 	= require('webserver').create() 
var system 	= require('system')
var process = require('child_process')
var spawn 	= process.spawn


var fetchTimeout 	= 4

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
		execWorker(request, response, "post", params.url, request.post)
	}
}

function getRequestHandler(request, response){
	var params = formatQueryParams(request.url)
	if(!params.url){
		response.statusCode = 500
		response.write("Invalid url query param")
		response.close()
	}else{
		execWorker(request, response, "get", params.url)
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

function execWorker(request, response, type, url, data){
	var successdata = ""
	var errordata 	= ""
	var child 		= spawn('phantomjs', ["worker.js", type, url, data])

	child.stdout.on("data", function(data){
		successdata += data  
	})

	child.stderr.on("data", function(data){
		errordata += data
	})
	// child.kill('SIGKILL')
	child.on('exit', function(code){
		var data = ""
		if(errordata){
			response.statusCode = 500
			data = errordata
		}else{
			response.statusCode = 200
			data = successdata
		}
		response.write(data)
		response.close()
	})

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
init()