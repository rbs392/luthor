"use strict"
const utils = require('./utils')

const handler = {
	"postRequestHandler" : function(request, response){
		if(!request.query.url){
			utils.sendError(500, "Invalid url query params", request.url)
		}else{
			if(!request.body){
				utils.sendError(500, "Invalid post data expected html recieved empty string", request.url)
			}else{
				utils.execWorker(request, response, 'post', request.query.url, request.body?request.body:"")
			}
		}
	},

	"getRequestHandler" : function(request, response){
		if(!request.query.url){
			utils.sendError(500, "Invalid url query params", request.url)
		}else{
			utils.execWorker(request, response, 'get', request.query.url, request.body?request.body:"")
		}
	}
}

module.exports = handler
