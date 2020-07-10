const common = require('./common.js');

var config = {username:`${common.program.username}`, token:`${common.program.token}`, org:`${common.program.org}`};

deleteAPIProxies(config);

async function deleteAPIProxies(config){
	console.log("Deleting API Proxies");
	let apis = await common.getEntities(config, "apis");
	if (apis === null) {
		console.log("API Proxies: NONE");
		return;
	}
	let ignoreAPIs = ["oauth", "helloworld", "apigee-test_bundle"];
	apis = apis.filter(item => !ignoreAPIs.includes(item));
	console.log("API Proxies: "+apis);
	for (api of apis){
	  	let resp = await common.getEntities(config, "apis/"+api+"/deployments");
			if (resp === null) {
				console.log("Deployments: NONE");
				return;
			}
	  	for (e of resp.environment){
	  		//if(e.name === config.env){
	  			let revision = e.revision[0].name;
	  			console.log("Undeploying Revision:"+revision+" of API Proxy: "+api);
	  			await common.deleteEntities(config, "/environments/"+e.name+"/apis/"+api+"/revisions/"+revision+"/deployments");
	  		//}
	  	}
	  	console.log("Deleting API Proxy: "+api);
	  	await common.deleteEntities(config, "apis/"+api);
	}
}