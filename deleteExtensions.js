const common = require('./common.js');
const rp = require("request-promise");

var config = {username:`${common.program.username}`, token:`${common.program.token}`, org:`${common.program.org}`};

deleteExtensions(config);

async function deleteExtensions(config){
	let envs = ["test", "prod", "portal"];
	for (env of envs){
		let extensions = await getAllExtensionsInEnv(config, config.token, env);
		if (extensions == null) {
			console.log("No extensions found in "+env);
			continue;
		}
		console.log(extensions);
		for (extension of extensions){
			await undeployExtension(config.token, extension);
			await deleteExtension(config.token, extension);
		}
	}
}


async function undeployExtension(extension){
	console.log("Undeploying extensions in "+env+" environment");
	let options = {
	    method: "PATCH",
	    uri: extension,
	    headers: {
        	"Authorization": "Bearer "+config.token
    	},
    	body: {
        	state: "UNDEPLOYED"
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

async function getAllExtensionsInEnv(config, env){
	let options = {
	    method: "GET",
	    uri: "https://api.enterprise.apigee.com/v1/organizations/"+config.org+"/environments/"+env+"/extensions",
	    headers: {
        	"Authorization": "Bearer "+config.token
    	},
	    json: true
	};
	try{
		let parsedBody = await rp(options);
		let contents = parsedBody.contents;
		let extensions = [];
		for (content of contents){
			extensions.push(content.self);
		}
		return extensions;
	}
	catch(err){
		console.log(err);
	}
}

async function deleteExtension(extension){
	let options = {
	    method: "DELETE",
	    uri: extension,
	    headers: {
        	"Authorization": "Bearer "+config.token
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