//
// Exports
//

async function route(context)
{
	let response = {};

	response.api = context.data.api;

	context.type = "application/json";
	context.body = JSON.stringify(response);
}

module.exports = route;