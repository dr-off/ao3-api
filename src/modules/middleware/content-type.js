//
// Exports
//

async function middleware(context, next)
{
	//
	// Set Response Content Type
	//

	context.type = "application/json";

	//
	// Execute Next Middleware
	//

	await next();
}

module.exports = middleware;