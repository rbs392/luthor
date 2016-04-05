"use strict"
const process 		= require("process")
const express 		= require("express")
const bodyParser 	= require("body-parser")
const handler 		= require("./handler")
const compression 	= require("compression")

const app 			= express()

app.use(bodyParser.text({limit: '5mb', inflate: true, type: "text/html"}))

app.get("/fetch", handler.getRequestHandler)
app.post("/render", handler.postRequestHandler)

function init(){
	if(process.argv.length!==3){
		console.log('Usage: server.js <some port>')
	    process.exit(1)
	}else{
		const port = process.argv[2]

		app.listen(port, ()=>{
			console.log("App started on port "+ port)
		})
	}
}

//start here
module.exports = {
	"start" : init
}