//
// Exports
//

async function route(context)
{
	let response = {};

	response.error = "Endpoint not implemented.";
	
	context.body = JSON.stringify(response);
}

module.exports = route;