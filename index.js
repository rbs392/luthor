"use strict"
var page 	= require('webpage').create()
var server 	= require('webserver').create() 
var system 	= require('system')

//config need to be from env/args
//TODO: why not timeout through query params
var timeout = 3000
var fetchTimeout = 4

var requestArr 	= []
var responseArr = []

page.settings.localToRemoteUrlAccessEnabled = true
page.settings.webSecurityEnabled 			= false
page.settings.resourceTimeout 				= fetchTimeout*1000

page.viewportSize = {
  width: 1200,
  height: 720
};

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
		page.onError 				= onError.bind(this, response)
		page.onResourceRequested 	= onResourceRequested
		page.onResourceReceived 	= onResourceReceived
		page.onResourceError 		= onResourceError.bind(this, response)
	}
}

function formatQueryParams(params){
	var result = {}
	var queryRegex = /\/\w*\?url=(.*)/
	result.url = params.match(queryRegex)?params.match(queryRegex)[1]:""
	return result
}

function returnFetchedPage(interval, response){
	clearInterval(interval)
	response.statusCode = 200
	response.write(page.content)
	response.close()
	// page.close not needed as it is continuous process
}

function pageHandler(url, request, response, status){
	
	var flag = true
	if(!status){
		response.statusCode = 500
		response.write("Fetch failed for the url - "+url)
	}else{
		var retryCount = 0
		var interval = setInterval(function(){
			console.log(requestArr.length)
			
			if(retryCount>fetchTimeout)
				returnFetchedPage(interval, response, page)

			if(requestArr.length<=0)
				returnFetchedPage(interval, response, page)
			
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

function onResourceError(response, resourceErr){
	//Better handle resource errors
	response.statusCode = 500
	response.write("Unable to fetch url -"+ resourceErr.url)
	response.close()
	
	var index = requestArr.indexOf(resourceErr.url)
	requestArr.splice(index, 1)
}

function onError(response, msg, trace){
	console.log("msg")
	// response.statusCode = 500
	// response.write(msg)
	// response.write(trace)
	// response.close()

}