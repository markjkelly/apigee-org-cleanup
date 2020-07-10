const common = require('./common.js');

var config = {username:`${common.program.username}`, token:`${common.program.token}`, org:`${common.program.org}`};

deleteReports(config);

async function deleteReports(config){
	console.log("Deleting Custom Reports");
	let reports = await common.getEntities(config, "reports");
	if (reports == null) {
		console.log("Reports: NONE");
		return;
	}
	for (report of reports.qualifier){
	  	console.log("Deleting Report: "+report.name);
	  	await common.deleteEntities(config, "reports/"+report.name);
	}
}