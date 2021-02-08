//
// Dependencies
//

const bent = require("bent");
const cheerio = require("cheerio");

const { ratings, archiveWarnings, categories } = require("./../../data/ao3");

const util = require("./../util");

//
// Locals
//

const getString = bent("https://archiveofourown.org/works/", "string", 200, 
{ 
	// Pretend we're Chrome
	"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.146 Safari/537.36",

	// Cookie required to skip the view adult content warning on AO3
	"Cookie": "view_adult=true;",
});

//
// Exports
//

async function route(context)
{
	let work_id = context.params.work_id;
	let chapter_id = context.params.chapter_id;

	let requestUrl = "";

	requestUrl += work_id;

	if(chapter_id)
		requestUrl += "/chapters/" + chapter_id;
	else if(context.request.query.view_full_work)
		requestUrl += "?view_full_work=true";

	let html = await getString(requestUrl);

	let $ = cheerio.load(html);

	let response = {};

	//
	// API Information
	//

	response.api =
	{
		version: "1.0",
	};

	//
	// Work
	//

	response.work = {};
	
	//
	// Work Identifiers
	//
	
	response.work.id = parseInt(work_id);

	response.work.url = "/works/" + work_id;

	//
	// Work Information Block
	//

	// Rating
	{
		response.work.rating = undefined;

		let element = $("dd.rating.tags > ul > li").first();
		let text = element.text();

		response.work.rating =
		{
			index: ratings[text],
			title: text,
			url: element.children("a").prop("href"),
		}
	}

	// Archive Warnings
	{
		response.work.archiveWarnings = [];
	
		util.populateArrayFromListElement($, response.work.archiveWarnings, "dd.warning.tags > ul > li", archiveWarnings);
	}

	// Categories
	{
		response.work.categories = [];

		util.populateArrayFromListElement($, response.work.categories, "dd.category.tags > ul > li", categories);
	}

	// Fandoms
	{
		response.work.fandoms = [];

		util.populateArrayFromListElement($, response.work.fandoms, "dd.fandom.tags > ul > li");
	}

	// Relationships
	{
		response.work.relationships = [];

		util.populateArrayFromListElement($, response.work.relationships, "dd.relationship.tags > ul > li");
	}

	// Characters
	{
		response.work.characters = [];

		util.populateArrayFromListElement($, response.work.characters, "dd.character.tags > ul > li");
	}

	// Additional Tags
	{
		response.work.additionalTags = [];

		util.populateArrayFromListElement($, response.work.additionalTags, "dd.freeform.tags > ul > li");
	}
	
	// Language
	{
		response.work.language = $("dd.language").text().trim();
	}

	// Stats
	{
		response.work.stats = {};
	
		response.work.stats.publication_date = $("dd.published", "dd.stats").text();

		let statusElement = $("dd.status", "dd.stats");

		if(statusElement.length > 0)
			response.work.stats.last_update_date = statusElement.text();
	
		response.work.stats.words = util.cleanAndParseInt($("dd.words", "dd.stats").text());
	
		let chapters = $("dd.chapters", "dd.stats").text().trim().split("/");
		response.work.stats.chapters =
		{
			published: util.cleanAndParseInt(chapters[0]),
			total: chapters[1] != "?" ? util.cleanAndParseInt(chapters[1]) : -1,
		}
	
		response.work.stats.comments = util.cleanAndParseInt($("dd.comments", "dd.stats").text());
	
		response.work.stats.kudos = util.cleanAndParseInt($("dd.kudos", "dd.stats").text());
	
		response.work.stats.bookmarks = util.cleanAndParseInt($("dd.bookmarks", "dd.stats").text());
	
		response.work.stats.hits = util.cleanAndParseInt($("dd.hits", "dd.stats").text());
	}

	//
	// Work Metadata
	//

	// Title
	{
		response.work.title = $(".title.heading", "#workskin").text().trim();
	}

	// Authors
	{
		response.work.authors = [];

		$("#workskin > .preface.group > h3.byline.heading > a").each(function(i, element)
		{
			let author = {};
	
			author.name = $(this).text();
			author.url = $(this).prop("href");
	
			response.work.authors.push(author);
		});
	}

	// 
	// Series (if the work is apart of at least one)
	//

	{
		let seriesElements = $("span.series", "dd.series");

		if(seriesElements.length > 0)
		{
			response.series = [];

			seriesElements.each(function(index, element)
			{

				let series = {};

				let seriesLink = $(this).find("span.position").find("a");
				series.id = parseInt(seriesLink.prop("href").split("/")[2]);
				series.title = seriesLink.text();
				series.url = seriesLink.prop("href");

				let previousWorkLink = $(this).find("a.previous");
				if(previousWorkLink.length > 0)
				{
					series.previous_work =
					{
						id: parseInt(previousWorkLink.prop("href").split("/")[2]),
						url: previousWorkLink.prop("href"),
					}
				}

				let nextWorkLink = $(this).find("a.next");
				if(nextWorkLink.length > 0)
				{
					series.next_work =
					{
						id: parseInt(nextWorkLink.prop("href").split("/")[2]),
						url: nextWorkLink.prop("href"),
					}
				}

				response.series.push(series);
			});
		}
	}

	//
	// Chapter(s) Information
	//

	if(response.work.stats.chapters.total != 1)
	{
		response.chapters = [];

		$("#chapters").children().each(function(i, element)
		{
			let titleElement = $(this).find("h3.title");

			let chapterUrl = titleElement.children("a").prop("href");

			let chapterId = parseInt(chapterUrl.split("/")[4]);
			
			let chapterNumber = parseInt(titleElement.children("a").text().split(" ")[1]);

			let chapterTitle = titleElement.contents().filter((i, element) => element.type == "text").text().trim().substr(2); // Partially taken from https://stackoverflow.com/a/23956052

			let chapter = 
			{
				id: chapterId,
				number: chapterNumber, 
				title: chapterTitle,
				url: chapterUrl,
			};

			response.chapters.push(chapter);
		});
	}

	context.type = "application/json";
	context.body = JSON.stringify(response);
};

module.exports = route;