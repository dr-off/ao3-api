//
// Dependencies
//

const cheerio = require("cheerio");

//
// Exports
//

async function route(context)
{
	// 
	// Initialise Response Object
	//

	let response = {};

	// 
	// Get Parameters
	//

	let series_id = context.params.series_id;

	//
	// Assemble Request URL
	//

	let requestUrl = "/series/" + series_id;

	//
	// Perform the Request (and respond with an error if it fails for some reason)
	//

	let rawResponse;
	try
	{
		rawResponse = await context.axios.get(requestUrl);
	} 
	catch(error)
	{
		console.log(error);

		response.error = error.message;

		context.body = JSON.stringify(response);

		return;
	}

	let html = rawResponse.data;

	//
	// Load the Document with Cheerio
	//

	let $ = cheerio.load(html);
	
	//
	// Series Identifiers
	//
	
	response.id = parseInt(series_id);

	response.url = "/series/" + series_id;

	//
	// Series Metadata & Information Block
	//

	// Title
	{
		response.title = $("h2.heading", "#main").text().trim();
	}

	// General Information Block Code (clusterfuck because AO3 doesn't have classes on these)
	{
		$("#main > .wrapper > .series.meta.group > dt").each(function(index, element)
		{
			let section = $(this).text().slice(0, -1);

			switch(section)
			{
				case "Creator":
				case "Creators":
					{
						response.authors = [];

						$(this).next().find("a").each(function(index, element)
						{
							let author = {};
				
							author.url = $(this).prop("href");
				
							author.name = $(this).text().trim();
				
							response.authors.push(author);
						});
					}

					break;

				case "Series Begun":
					{
						response.begin_date = $(this).next().text().trim();
					}

					break;

				case "Series Updated":
					{
						response.last_update_date = $(this).next().text().trim();
					}

					break;

				case "Description":
					{
						response.description = $(this).next().find(".userstuff").html().trim();
					}

					break;

				case "Notes":

					// Intentionally not implemented.

					break;

				case "Stats":
					{
						response.stats = 
						{
							words: 0,
							works: 0,
							complete: false,
							bookmarks: 0,
						};

						$(this).next().find("dl.stats").find("dt").each(function(index, element)
						{
							let stat = $(this).text().slice(0, -1);

							switch(stat)
							{
								case "Words":
									response.stats.words = context.util.cleanAndParseInt($(this).next().text());

									break;

								case "Works":
									response.stats.works = context.util.cleanAndParseInt($(this).next().text());

									break;

								case "Complete":
									response.stats.complete = $(this).next().text() == "Yes";

									break;

								case "Bookmarks":
									response.stats.bookmarks = context.util.cleanAndParseInt($(this).next().text());

									break;

								default:
									break;
							}
						});
					}

					break;

				default:
					debugger;
			}
		});
	}

	//
	// Works
	//

	{
		response.works = [];

		$(".series.work.index.group > li", "#main").each(function(index, element)
		{
			let work_id = $(this).prop("id").split("_")[1];

			//
			// Initialise Work Object
			//

			let work = {};

			//
			// Work Identifiers
			//

			work.id = parseInt(work_id);

			work.url = "/works/" + work_id;

			//
			// Work Metadata
			//

			{
				work.title = "";
				work.authors = [];

				$(this).find(".header.module > h4.heading > a").each(function(index, element)
				{
					let href = $(this).prop("href");
					let rel = $(this).prop("rel");

					if(href.startsWith("/works/"))
					{
						work.title = $(this).text();
					}
					else if(rel == "author")
					{
						let author = {};

						author.url = href;

						author.name = $(this).text();

						work.authors.push(author);
					}

					console.log($(this).prop("rel"));
				});
			}

			//
			// Push the Work into the Response Object
			//

			response.works.push(work);
		});
	}

	//
	// Stringify Response
	//
	
	context.body = JSON.stringify(response);
}

module.exports = route;