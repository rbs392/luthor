"use strict"
const process = require('child_process')
const spawn 	= process.spawn

const utils = {
	"execWorker" : function(request, response, type, url, reqData){
		let successdata = ""
		let errordata 	= ""
		let htmlPresent = false
		let child 		= spawn('phantomjs', ["--config=config.json", "./worker/worker.js", type, url, reqData])
		utils.logger("START", url)

		child.stdout.on("data", function(data){
			data = data.toString()
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
					if(!/SUCCESS/.test(data)){
						successdata += data
					}
				}
			}
		})

		child.stderr.on("data", function(data){
			data = data.toString()
			errordata += data
		})
		child.on('close', function(code){
			let data = ""
			if(errordata){
				response.status(500)
				data = errordata
				utils.logger("ERROR", errordata+ " : "+ url)
			}else if(successdata){
				response.status(200)
				data = successdata
				utils.logger("SUCCESS", url)
			}else{
				response.status(500)
				data = "No data recieved"
				utils.logger("FAILURE", url)
			}
			response.write(data)
			response.end()
		})

	},

	"logger" : function(type, message){
		let date = Date().toString()
		console.log(date+" : "+type.toUpperCase()+" : "+message)
	},

	"sendError" : function(statusCode, msg, url){
		response.status(statusCode)
		response.send(`${msg} - ${url}`)
		response.end()
	}
}

module.exports = utils