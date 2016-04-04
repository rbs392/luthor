"use strict"
var process = require('child_process')
var fs 		= require('fs')
var spawn 	= process.spawn

//log to file
fs.write('./outputLog/result', "statusCode"+"\t"+"actualsize"+"\t"+"outputsize"+"\t"+"URL"+"\n", 'a')


var utils = {
	"formatQueryParams" : function(params){
		var result = {}
		var queryRegex = /\/\w*\?url=(.*)/
		var url = params.match(queryRegex)[1]
		url = decodeURIComponent(url)
		result.url = url?decodeURIComponent(url):""
		return result
	},

	"execWorker" : function(request, response, type, url, reqData){
		var successdata = ""
		var errordata 	= ""
		var htmlPresent = false
		var child 		= spawn('phantomjs', ["./worker/worker.js", type, url, reqData])
		utils.logger("START", url)

		child.stdout.on("data", function(data){
			if(/ERROR/.test(data)){
				utils.logger("FETCH INCOMPLETE", url)
			}

			if(/<html><head><\/head><body><\/body><\/html>/.test(data)){
				errordata += "Empty html recieved"
			}else{
				if(/<\/html>/.test(data)){
					htmlPresent = false
					successdata += data
				}else if(/<html.*/.test(data)){
					htmlPresent = true
				}

				if(htmlPresent){
					successdata += data
				}
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
				utils.logger("ERROR", errordata+ " : "+ url)
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
			fs.write('./outputLog/result', response.statusCode+"\t\t\t"+reqData.length+"\t\t\t"+data.length+"\t"+url+"\n", 'a')
			fs.write('./outputLog/rawResult', response.statusCode+"\t\t\t"+reqData.length+"\t\t\t"+data.length+"\t"+url+"\n", 'a')
			fs.write('./outputLog/rawResult', "==================================================================\n"+data.replace(/[\t\s\n]/g,'')+"\n", 'a')
		})

	},

	"logger" : function(type, message){
		var date = Date().toString()
		console.log(date+" : "+type.toUpperCase()+" : "+message)
	}
}

module.exports = utils