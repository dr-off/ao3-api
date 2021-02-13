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
		context.data =
		{
			api: require("./data/api"),
			ao3: require("./data/ao3"),
		}

		await next();
	});

	// Middleware: Router
	{
		let mwRouter = koaRouter();

		mwRouter.get("/version", require("./modules/routes/version"));

		mwRouter.get("/works/:work_id/chapters/:chapter_id", routeWork);
		mwRouter.get("/works/:work_id", routeWork);

		app.use(mwRouter.routes());
	}

	// Listen for requests
	app.listen(configuration.port);
}

run()