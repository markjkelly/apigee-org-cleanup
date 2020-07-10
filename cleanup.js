const rp = require("request-promise");
var util = require("util");
const { program } = require('commander');

program
  .requiredOption('-u, --username <type>', 'username must be specified')
  .requiredOption('-t, --token <type>', 'token must be specified')
  .requiredOption('-o, --org <type>', 'organisation must be specified')
;

program.parse(process.argv);

var config = {username:`${program.username}`, token:`${program.token}`, org:`${program.org}`};
var mgmtURL = "https://api.enterprise.apigee.com/v1/organizations";
var mgmtOAuthURL = "https://login.apigee.com/oauth/token";

cleanup();

async function cleanup() {
	await deleteAppsAndDevelopers(config);
	await deleteAPIProducts(config);
	await deleteReports(config)
	await deleteExtensions(config);
	await deleteAPIProxies(config);
	await deleteSharedFlows(config);
	await deleteAPIPortals(config);
	await deleteSpecs(config);
}

async function deleteAppsAndDevelopers(config){
	console.log("Deleting Apps");
	let developers = await getEntities(config, "developers");
	if (developers == null) {
		console.log("Developers: NONE");
		return;
	}
	console.log("Developers: "+developers);
	for (developer of developers){
		console.log("Fetching Apps for "+developer);
	  	let apps = await getEntities(config, "developers/"+developer+"/apps");
			if (apps == null) {
				console.log("Apps: NONE");
				continue;
			}
	  	console.log("Apps: "+apps);
	  	for (app of apps){
	  		await deleteEntities(config, "developers/"+developer+"/apps/"+app);
	  	}
	  	console.log("Deleting developer: "+developer);
	  	await deleteEntities(config, "developers/"+developer);
	}
}

async function deleteAPIProducts(config){
	console.log("Deleting API Products");
	let apiproducts = await getEntities(config, "apiproducts");
	if (apiproducts == null) {
		console.log("API Products: NONE");
		return;
	}
	console.log("API Products: "+apiproducts);
	for (apiproduct of apiproducts){
	  	console.log("Deleting API Product: "+apiproduct);
	  	await deleteEntities(config, "apiproducts/"+apiproduct);
	}
}

async function deleteReports(config){
	console.log("Deleting Custom Reports");
	let reports = await getEntities(config, "reports");
	if (reports == null) {
		console.log("Reports: NONE");
		return;
	}
	for (report of reports.qualifier){
	  	console.log("Deleting Report: "+report.name);
	  	await deleteEntities(config, "reports/"+report.name);
	}
}

async function deleteSharedFlows(config){
	console.log("Deleting SharedFlows");
	let sharedFlows = await getEntities(config, "sharedflows");
	if (sharedFlows == null) {
		console.log("Sharedflows: NONE");
		return;
	}
	console.log("Sharedflows: "+sharedFlows);
	for (sharedFlow of sharedFlows){
	  	let resp = await getEntities(config, "sharedflows/"+sharedFlow+"/deployments");
			if (resp == null) {
				console.log("Deployments: NONE");
				continue;
			}
	  	for (e of resp.environment){
	  		//if(e.name === config.env){
					if (e == null || e.revision == null || e.revision[0] == null || e.revision[0].name == null) {
						console.log("Failed to resolve revision.")
						continue;
					}
	  			let revision = e.revision[0].name;
	  			console.log("Undeploying Revision:"+revision+" of sharedflow: "+sharedFlow);
	  			await deleteEntities(config, "/environments/"+e.name+"/sharedflows/"+sharedFlow+"/revisions/"+revision+"/deployments");
	  		//}
	  	}
	  	console.log("Deleting sharedflow: "+sharedFlow);
	  	await deleteEntities(config, "sharedflows/"+sharedFlow);
	}
}

async function deleteAPIProxies(config){
	console.log("Deleting API Proxies");
	let apis = await getEntities(config, "apis");
	if (apis === null) {
		console.log("API Proxies: NONE");
		return;
	}
	let ignoreAPIs = ["oauth", "helloworld", "apigee-test_bundle"];
	apis = apis.filter(item => !ignoreAPIs.includes(item));
	console.log("API Proxies: "+apis);
	for (api of apis){
	  	let resp = await getEntities(config, "apis/"+api+"/deployments");
			if (resp === null) {
				console.log("Deployments: NONE");
				return;
			}
	  	for (e of resp.environment){
	  		//if(e.name === config.env){
	  			let revision = e.revision[0].name;
	  			console.log("Undeploying Revision:"+revision+" of API Proxy: "+api);
	  			await deleteEntities(config, "/environments/"+e.name+"/apis/"+api+"/revisions/"+revision+"/deployments");
	  		//}
	  	}
	  	console.log("Deleting API Proxy: "+api);
	  	await deleteEntities(config, "apis/"+api);
	}
}

async function deleteSpecs(config){
	console.log("Deleting Specs");
	let specs = await getSpecs(config);
	console.log(specs);
	for (spec of specs){
		await deleteSpec(config, spec)
	}
}

async function deleteAPIPortals(config){
	console.log("Deleting API Portals");
	let portals = await getPortals(config);
	console.log(portals);
	for (portal of portals){
		await deletePortal(config, portal)
	}
}

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


async function getEntities(config, entity){
	//console.log("Fetching "+entity+" from Apigee org: "+config.org);
	let options = {
	    method: "GET",
	    uri: mgmtURL+"/"+config.org+"/"+entity,
	    headers: {
			"Authorization": "Bearer "+config.token
    	},
	    json: true
	};
	try{
		let parsedBody = await rp(options);
		console.log(parsedBody);
		return parsedBody;
	}
	catch(err){
		console.log(err);
		return null;
	}
}

async function deleteEntities(config, entity){
	console.log("Deleting "+entity+" from Apigee org: "+config.org);
	let options = {
	    method: "DELETE",
	    uri: mgmtURL+"/"+config.org+"/"+entity,
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

async function getAccessToken(config){
	console.log("Getting OAuth Access token");
	let options = {
	    method: "POST",
	    uri: mgmtOAuthURL,
	    form: {
	        grant_type: "password",
	        username: config.username,
	        password: config.password,
			client_id: "edgecli",
			client_secret: "edgeclisecret"
	    },
	    json: true
	};
	try{
		let parsedBody = await rp(options);
		let accessToken = parsedBody.access_token;
		return accessToken;
	}
	catch(err){
		console.log(err);
	}
}