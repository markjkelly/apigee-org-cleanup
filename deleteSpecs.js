const common = require('./common.js');
const rp = require("request-promise");

var config = {username:`${common.program.username}`, token:`${common.program.token}`, org:`${common.program.org}`};
module.exports.getEntities = deleteSpecs;

deleteSpecs(config);

async function deleteSpecs(config){
	console.log("Deleting Specs");
	let specs = await getSpecs(config);
	console.log(specs);
	for (spec of specs){
		await deleteSpec(config, spec)
	}
}

async function getSpecs(config){
	let options = {
	    method: "GET",
	    uri: "https://api.enterprise.apigee.com/v1/homeFolder/contents",
	    headers: {
        	"Authorization": "Bearer "+config.token,
        	"X-Org-Name": config.org
    	},
	    json: true
	};
	try{
		let parsedBody = await rp(options);
		let contents = parsedBody.contents;
		let specs = [];
		for (content of contents){
			specs.push(content.self);
		}
		return specs;
	}
	catch(err){
		console.log(err);
	}
}

async function deleteSpec(config, spec){
	console.log("Deleting spec: "+spec);
	let options = {
	    method: "DELETE",
	    uri: "https://api.enterprise.apigee.com/v1"+spec,
	    headers: {
        	"Authorization": "Bearer "+config.token,
        	"X-Org-Name": config.org
    	},
	    json: true
	};
	try{
		let parsedBody = await rp(options);
		return parsedBody;
	}
	catch(err){
		console.log(err);
	}
}