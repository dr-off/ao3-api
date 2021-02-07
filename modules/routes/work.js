//
// Dependencies
//

const bent = require("bent");
const cheerio = require("cheerio");

//
// Locals
//

const ratings =
{
	"Not Rated": 0,
	"General Audiences": 1,
	"Teen And Up Audiences": 2,
	"Mature": 3,
	"Explicit": 4,
}

const getString = bent("https://archiveofourown.org/works/", "string", 200, { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.146 Safari/537.36" });

//
// Exports
//

async function route(context)
{
	let work_id = context.params.work_id;
	let chapter_id = context.params.chapter_id;

	let html;
	if(chapter_id)
		html = await getString(work_id + "/chapters/" + chapter_id);
	else
		html = await getString(work_id);

	let $ = cheerio.load(html);

	let response = {};

	response.api_version = [1, 0];

	response.work = {};
	
	response.work.id = parseInt(work_id);

	response.work.title = $(".title.heading", "#workskin").text().trim();

	// TODO: Authors

	let ratingText = $("dd.rating.tags").text().trim()
	response.work.rating =
	{
		index: ratings[ratingText],
		text: ratingText,
	}

	// TODO: Archive Warnings

	// TODO: Categories

	// TODO: Fandoms

	// TODO: Relationships

	// TODO: Characters

	// TODO: Additional Tags
	
	response.work.language = $("dd.language").text().trim();

	// TODO: Series

	response.work.stats = {};

	// TODO: Stats > Publication Date (how should I format this?)

	response.work.stats.words = parseInt($("dd.words", "dd.stats").text().trim().replace(",", ""));

	// TODO: Stats > Chapters

	// TODO: Stats > Comments

	response.work.stats.kudos = parseInt($("dd.kudos", "dd.stats").text().trim().replace(",", ""));

	// TODO: Stats > Bookmarks

	response.work.stats.hits = parseInt($("dd.hits", "dd.stats").text().trim().replace(",", ""));

	if(chapter_id)
	{
		response.chapter = {};

		response.chapter.id = parseInt(chapter_id);


	}

	context.type = "application/json";
	context.body = JSON.stringify(response);
};

module.exports = route;