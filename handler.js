var utils = require('./utils')

var handler = {
	"postRequestHandler" : function(request, response){
		var params = utils.formatQueryParams(request.url)
		if(!params.url){
			response.statusCode = 500
			response.write("Invalid url query param")
			response.close()
		}else if(!request.post){
			response.statusCode = 500
			response.write("Invalid post body - HTML required ")
			response.close()
		}else{
			utils.execWorker(request, response, "post", params.url, request.post)
		}
	},

	"getRequestHandler" : function(request, response){
		var params = utils.formatQueryParams(request.url)
		if(!params.url){
			response.statusCode = 500
			response.write("Invalid url query param")
			response.close()
		}else{
			utils.execWorker(request, response, "get", params.url)
		}

	},

	"invalidRequestHandler" : function(request, response){
		response.statusCode = 500
		response.write("Invalid operation use GET or POST method")
		response.close()
	}
}

module.exports = handler