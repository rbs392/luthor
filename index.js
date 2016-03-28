"use strict"
var page 	= require('webpage').create()
var server 	= require('webserver').create() 
var system 	= require('system')
var timeout = 3000

var requestArr 	= []
var responseArr = []


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
	var params = formatQueryParams(request.url)
	if(!params.url){
		response.statusCode = 500
		response.write("Invalid url query param")
		response.close()
	}else{
		page.open(params.url, pageHandler.bind(this,params.url, request, response))
		page.onResourceRequested 	= onResourceRequested
		page.onResourceReceived 	= onResourceReceived
		page.onLoadFinished 		= onLoadFinished
	}
}

function formatQueryParams(params){
	var result = {}
	var queryRegex = /\/\w*\?url=(.*)/
	result.url = params.match(queryRegex)?params.match(queryRegex)[1]:""
	return result
}

function pageHandler(url, request, response, status){
	var flag = true
	if(!status){
		response.statusCode = 500
		response.write("Fetch failed for the url - "+url)
	}else{
		var interval = setInterval(function(){
			if(requestArr.length<=0){
				
				clearInterval(interval)
				
				response.statusCode = 200
				response.write(page.content)
				response.close()
			}
			console.log(requestArr)
		}, 2000)
	}

}

function onResourceRequested(data, networkRequest){
	requestArr.push(data.url)
}

function  onResourceReceived(data){
	if(data.stage==='end'){
		var index = requestArr.indexOf(data.url)
		requestArr.splice(index, 1)
	}
}

function onLoadFinished(status){
	console.log("status")
	console.log(status)
	console.log(requestArr.length)
	console.log(responseArr.length)
}