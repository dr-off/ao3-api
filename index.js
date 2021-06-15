//
// Dependencies
//

const configuration = require("./configuration");

const axios = require("axios").default;
const chalk = require("chalk");
const koa = require("koa");
const koaRouter = require("koa-router");

const util = require("./modules/util");

const mwContentType = require("./modules/middleware/content-type");

const routeWork = require("./modules/routes/work");

//
// Locals
//

const axiosInstance = axios.create(
	{
		baseURL: "https://archiveofourown.org/",
		headers:
		{
			"Cookie": "view_adult=true;",
			"User-Agent": `AO3 API ${ configuration.version }`,
		}
	});

axios.defaults.headers.common["Cookie"] = "view_adult=true;";
axios.defaults.headers.common["User-Agent"] = `AO3 API ${ configuration.version }`;

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
		context.axios = axiosInstance;

		context.data =
		{
			api: require("./data/api"),
			ao3: require("./data/ao3"),
		}

		context.util = util;

		await next();
	});

	// Middleware: Router
	{
		let mwRouter = koaRouter();

		mwRouter.get("/version", 								mwContentType, require("./modules/routes/version"));

		mwRouter.get("/works/:work_id/chapters/:chapter_id", 	mwContentType, routeWork);
		mwRouter.get("/works/:work_id", 						mwContentType, routeWork);

		mwRouter.get("/series/:series_id", 						mwContentType, require("./modules/routes/series"));

		app.use(mwRouter.routes());
	}

	// Listen for requests
	app.listen(configuration.port);
}

run()