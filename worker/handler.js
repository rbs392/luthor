var handler = {

	"requestArr" : [],

	"onResourceRequested" : function (data, networkRequest){
		handler.requestArr.push(data.url)
	},

	 "onResourceReceived" : function (data){
		if(data.stage==='end'){
			var index = handler.requestArr.indexOf(data.url)
			handler.requestArr.splice(index, 1)
		}
	},

	"onResourceTimeout" : function (data){
		var index = handler.requestArr.indexOf(data.url)
		handler.requestArr.splice(index, 1)
	},

	"onResourceError" : function (resourceErr){
		var index = handler.requestArr.indexOf(resourceErr.url)
		handler.requestArr.splice(index, 1)
	}

}
module.exports = handler