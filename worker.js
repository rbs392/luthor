//system level declarations
var page 	= require('webpage').create()
var system 	= require('system')

//argument related variables
var type	= system.args[1]
var url 	= system.args[2]
var data 	= system.args[3]


//code level variables
//config need to be from env/args
//TODO: why not timeout through query params

var requestArr 		= []
var fetchTimeout 	= 4

page.onResourceRequested 	= onResourceRequested
page.onResourceReceived 	= onResourceReceived
page.onResourceError 		= onResourceError

page.settings.localToRemoteUrlAccessEnabled = true
page.settings.webSecurityEnabled 			= false
page.settings.resourceTimeout 				= fetchTimeout*1000

page.viewportSize = {
  width: 1200,
  height: 720
};

function onResourceRequested(data, networkRequest){
	requestArr.push(data.url)
}

function  onResourceReceived(data){
	if(data.stage==='end'){
		var index = requestArr.indexOf(data.url)
		requestArr.splice(index, 1)
	}
}

function onResourceError(resourceErr){
	var index = requestArr.indexOf(resourceErr.url)
	requestArr.splice(index, 1)
}


function pageHandler(status){
	var flag 			= true
	if(!status){
		console.error("Fetch failed for the url - "+url)
		phantom.exit(1)
	}else{
		var retryCount = 0
		var interval = setInterval(function(){
			if(retryCount>fetchTimeout)
				returnFetchedPage(interval, page)

			if(requestArr.length<=0)
				returnFetchedPage(interval, page)
			
			retryCount++
		}, 1000)
	}

}

function returnFetchedPage(interval, page){
	clearInterval(interval)
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
	switch(type){
		case 'get': getHandler(url)
		break;
		case 'post': postHandler(data, url)
		break;
	}
}

init()