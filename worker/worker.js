"use strict"
//system level declarations
var page 	= require('webpage').create()
var system 	= require('system')
var config  = require('../config')

//argument related variables
var type	= system.args[1]
var url 	= system.args[2]
var data 	= system.args[3]


var successMsg 	= "SUCCESS"
var errorMsg 	= "ERROR"

//code level variables

var requestArr 		= []
var maxRetries 		= config.maxRetries

function onResourceRequested(data, networkRequest){
	var abort = false
	config.blockedResources.forEach(function(blockedUrl){
		var regexp = new RegExp(blockedUrl)
		abort = regexp.test(data.url)
	})
	if(abort){
		networkRequest.abort()
	}
	requestArr.push(data.url)
}

function  onResourceReceived(data){
	if(data.stage==='end'){
		var index = requestArr.indexOf(data.url)
		requestArr.splice(index, 1)
	}
}

function onResourceTimeout(data){
	var index = requestArr.indexOf(data.url)
	requestArr.splice(index, 1)
}

function onResourceError(resourceErr){
	var index = requestArr.indexOf(resourceErr.url)
	requestArr.splice(index, 1)
}


function pageHandler(status){
	var flag = true
	if(!status){
		console.error("Fetch failed for the url - "+url)
		phantom.exit(1)
	}else{
		var retryCount = 0
		var interval = setInterval(function(){
			if(retryCount>maxRetries)
				returnFetchedPage(errorMsg, interval, page)

			if(requestArr.length<=0)
				returnFetchedPage(successMsg, interval, page)
			
			retryCount++
		}, 1000)
	}

}

function returnFetchedPage(status, interval, page){
	clearInterval(interval)
	console.log(status+":"+ url)
	console.log(page.content)
	phantom.exit(0)
}


function getHandler(url){
	page.open(url, pageHandler)
}

function postHandler(data, url){
	page.setContent(data, url)
	pageHandler(true)
}

function init(){
	page.onResourceRequested 	= onResourceRequested
	page.onResourceReceived 	= onResourceReceived
	page.onResourceError 		= onResourceError
	page.onResourceTimeout 		= onResourceTimeout

	page.settings.resourceTimeout 	= config.resourceTimeout*1000
	page.settings.userAgent 		= config.userAgent

	page.viewportSize = config.viewPort

	switch(type){
		case 'get': getHandler(url)
		break;
		case 'post': postHandler(data, url)
		break;
	}
}

init()