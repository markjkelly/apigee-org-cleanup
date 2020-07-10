const { program } = require('commander');
const rp = require("request-promise");

module.exports.getEntities = getEntities;
module.exports.deleteEntities = deleteEntities;
module.exports.program = program;

var mgmtURL = "https://api.enterprise.apigee.com/v1/organizations";
var mgmtOAuthURL = "https://login.apigee.com/oauth/token";

program
  .requiredOption('-u, --username <type>', 'username must be specified')
  .requiredOption('-t, --token <type>', 'token must be specified')
  .requiredOption('-o, --org <type>', 'organisation must be specified')
;

program.parse(process.argv);

async function getEntities(config, entity) {
    //console.log("Fetching "+entity+" from Apigee org: "+config.org);
    let options = {
        method: "GET",
        uri: mgmtURL + "/" + config.org + "/" + entity,
        headers: {
            "Authorization": "Bearer " + config.token
        },
        json: true
    };
    try {
        let parsedBody = await rp(options);
        console.log(parsedBody);
        return parsedBody;
    }
    catch (err) {
        console.log(err);
        return null;
    }
}

async function deleteEntities(config, entity) {
    console.log("Deleting " + entity + " from Apigee org: " + config.org);
    let options = {
        method: "DELETE",
        uri: mgmtURL + "/" + config.org + "/" + entity,
        headers: {
            "Authorization": "Bearer " + config.token
        },
        json: true
    };
    try {
        let parsedBody = await rp(options);
        return parsedBody;
    }
    catch (err) {
        console.log(err);
    }
}

async function getAccessToken(config) {
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
    try {
        let parsedBody = await rp(options);
        let accessToken = parsedBody.access_token;
        return accessToken;
    }
    catch (err) {
        console.log(err);
    }
}