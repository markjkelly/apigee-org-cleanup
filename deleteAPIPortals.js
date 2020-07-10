const common = require('./common.js');
const rp = require("request-promise");

var config = {username:`${common.program.username}`, token:`${common.program.token}`, org:`${common.program.org}`};

deleteAPIPortals(config);

async function deleteAPIPortals(config){
	console.log("Deleting API Portals");
	let portals = await getPortals(config);
	console.log(portals);
	for (portal of portals){
		await deletePortal(config, portal)
	}
}

async function getPortals(config){
	let options = {
	    method: "GET",
	    uri: "https://api.enterprise.apigee.com/v1/portals/api/sites?orgname="+config.org,
	    headers: {
        	"Authorization": "Bearer "+config.token,
        	"X-Org-Name": config.org
    	},
	    json: true
	};
	try{
		let parsedBody = await rp(options);
		let contents = parsedBody.data;
		let portals = [];
		for (content of contents){
			portals.push(content.id);
		}
		return portals;
	}
	catch(err){
		console.log(err);
	}
}

async function deletePortal(config, portal){
	console.log("Deleting API Portal: "+portal);
	let options = {
	    method: "POST",
	    uri: "https://apigee.com/portals/api/sites/"+portal+"/trash",
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