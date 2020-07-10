const common = require('./common.js');

var config = {username:`${common.program.username}`, token:`${common.program.token}`, org:`${common.program.org}`};
module.exports.getEntities = deleteAppsAndDevelopers;

deleteAppsAndDevelopers(config);

async function deleteAppsAndDevelopers(config){
	console.log("Deleting Apps");
	let developers = await common.getEntities(config, "developers");
	if (developers == null) {
		console.log("Developers: NONE");
		return;
	}
	console.log("Developers: "+developers);
	for (developer of developers){
		console.log("Fetching Apps for "+developer);
	  	let apps = await common.getEntities(config, "developers/"+developer+"/apps");
			if (apps == null) {
				console.log("Apps: NONE");
				continue;
			}
	  	console.log("Apps: "+apps);
	  	for (app of apps){
	  		await common.deleteEntities(config, "developers/"+developer+"/apps/"+app);
	  	}
	  	console.log("Deleting developer: "+developer);
	  	await common.deleteEntities(config, "developers/"+developer);
	}
}