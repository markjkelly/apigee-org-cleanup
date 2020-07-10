const common = require('./common.js');

var config = {username:`${common.program.username}`, token:`${common.program.token}`, org:`${common.program.org}`};

deleteSharedFlows(config);

async function deleteSharedFlows(config){
	console.log("Deleting SharedFlows");
	let sharedFlows = await common.getEntities(config, "sharedflows");
	if (sharedFlows == null) {
		console.log("Sharedflows: NONE");
		return;
	}
	console.log("Sharedflows: "+sharedFlows);
	for (sharedFlow of sharedFlows){
	  	let resp = await common.getEntities(config, "sharedflows/"+sharedFlow+"/deployments");
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
	  			await common.deleteEntities(config, "/environments/"+e.name+"/sharedflows/"+sharedFlow+"/revisions/"+revision+"/deployments");
	  		//}
	  	}
	  	console.log("Deleting sharedflow: "+sharedFlow);
	  	await common.deleteEntities(config, "sharedflows/"+sharedFlow);
	}
}