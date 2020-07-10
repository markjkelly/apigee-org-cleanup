const common = require('./common.js');

var config = {username:`${common.program.username}`, token:`${common.program.token}`, org:`${common.program.org}`};

deleteAPIProducts(config);

async function deleteAPIProducts(config){
	console.log("Deleting API Products");
	let apiproducts = await common.getEntities(config, "apiproducts");
	if (apiproducts == null) {
		console.log("API Products: NONE");
		return;
	}
	console.log("API Products: "+apiproducts);
	for (apiproduct of apiproducts){
	  	console.log("Deleting API Product: "+apiproduct);
	  	await common.deleteEntities(config, "apiproducts/"+apiproduct);
	}
}