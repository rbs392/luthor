var process = require('child_process')
var spawn 	= process.spawn

var utils = {
	"formatQueryParams" : function(params){
		var result = {}
		var queryRegex = /\/\w*\?url=(.*)/
		result.url = params.match(queryRegex)?params.match(queryRegex)[1]:""
		return result
	},

	"execWorker" : function(request, response, type, url, data){
		var successdata = ""
		var errordata 	= ""
		var child 		= spawn('phantomjs', ["worker.js", type, url, data])

		child.stdout.on("data", function(data){
			successdata += data  
		})

		child.stderr.on("data", function(data){
			errordata += data
		})
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
}

module.exports = utils