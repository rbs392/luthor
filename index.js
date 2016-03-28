"use strict"
var page 	= require('webpage').create()
var server 	= require('webserver').create() 
var system 	= require('system')
var timeout = 3000
var fetchTimeout = 1

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
	}
}

function formatQueryParams(params){
	var result = {}
	var queryRegex = /\/\w*\?url=(.*)/
	result.url = params.match(queryRegex)?params.match(queryRegex)[1]:""
	return result
}

function pageHandler(url, request, response, status){
	function returnFetchedPage(interval){
		clearInterval(interval)
		response.statusCode = 200
		response.write(page.content)
		response.close()
	}
	
	var flag = true
	if(!status){
		response.statusCode = 500
		response.write("Fetch failed for the url - "+url)
	}else{
		var retryCount = 0
		var interval = setInterval(function(){
			
			if(retryCount>fetchTimeout)
				returnFetchedPage(interval)

			if(requestArr.length<=0)
				returnFetchedPage(interval)
			
			retryCount++
		}, 1000)
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