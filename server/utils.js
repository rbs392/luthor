"use strict"
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
		var htmlPresent = false
		var child 		= spawn('phantomjs', ["./worker/worker.js", type, url, data])
		utils.logger("START", url)


		child.stdout.on("data", function(data){
			if(/ERROR/.test(data)){
				utils.logger("FETCH INCOMPLETE", url)
			}
			
			if(/<html.*/.test(data)){
				htmlPresent = true
			}else if(/<\/html>/.test(data)){
				htmlPresent = false
				successdata += data
			}

			if(htmlPresent){
				successdata += data
			}
		})

		child.stderr.on("data", function(data){
			errordata += data
		})
		child.on('exit', function(code){
			var data = ""
			if(errordata){
				response.statusCode = 500
				data = errordata
				utils.logger("ERROR", errordata)
			}else if(successdata){
				response.statusCode = 200
				data = successdata
				utils.logger("SUCCESS", url)
			}else{
				response.statusCode = 500
				data = "No data recieved"
				utils.logger("FAILURE", url)
			}
			response.write(data)
			response.close()
		})

	},

	"logger" : function(type, message){
		var date = Date().toString()
		console.log(date+" : "+type.toUpperCase()+" : "+message)
	}
}

module.exports = utils