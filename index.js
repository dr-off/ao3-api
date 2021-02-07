//
// Dependencies
//

const configuration = require("./configuration");

const chalk = require("chalk");
const koa = require("koa");
const koaRouter = require("koa-router");

const routeWork = require("./modules/routes/work");


//
// Exports
//

async function run()
{
	// Initialise Koa
	const app = new koa({ proxy: true });

	// Middleware: Error Handler
	// TODO

	// Middleware: Globals
	app.use(async function(context, next)
	{
		await next();
	});

	// Middleware: Router
	{
		let mwRouter = koaRouter();

		mwRouter.get("/works/:work_id/chapters/:chapter_id", routeWork);
		mwRouter.get("/works/:work_id", routeWork);

		app.use(mwRouter.routes());
	}

	// Listen for requests
	app.listen(configuration.port);
}

run()