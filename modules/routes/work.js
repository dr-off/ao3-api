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

const getString = bent("https://archiveofourown.org/works/", "string", 200, { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.146 Safari/537.36" });

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
	
		$("dd.warning.tags > ul > li").each(function(i, element)
		{
			let text = $(this).text();
	
			let warning = 
			{
				index: archiveWarnings[text],
				name: text,
				url: $(this).children("a").prop("href"),
			};
	
			response.work.archiveWarnings.push(warning);
		});
	}

	// Categories
	{
		response.work.categories = [];

		$("dd.category.tags > ul > li").each(function(i, element)
		{
			let text = $(this).text();

			let category =
			{
				index: categories[text],
				name: text,
				url: $(this).children("a").prop("href"),
			}

			response.work.categories.push(category);
		});
	}

	// Fandoms
	{
		response.work.fandoms = [];
	
		$("dd.fandom.tags > ul > li").each(function(i, element)
		{
			let text = $(this).text();
	
			let fandom = 
			{
				name: text,
				url: $(this).children("a").prop("href"),
			};
	
			response.work.fandoms.push(fandom);
		});
	}

	// Relationships
	{
		// TODO
	}

	// Characters
	{
		// TODO
	}

	// Additional Tags
	{
		// TODO
	}
	
	// Language
	{
		response.work.language = $("dd.language").text().trim();
	}

	// Series (if the work is apart of one)
	{
		// TODO
	}

	// Stats
	{
		response.work.stats = {};
	
		// TODO: Publication Date (how should I format this?)

		// TODO: Last Update Date (for work-in-progress multi-chapter works)

		// TODO: Completion Date (for completed multi-chapter works)
	
		response.work.stats.words = util.cleanAndParseInt($("dd.words", "dd.stats").text());
	
		// Chapters
		{
			let chapters = $("dd.chapters", "dd.stats").text().trim().split("/");
			
			response.work.stats.published_chapters = util.cleanAndParseInt(chapters[0]);

			response.work.stats.total_chapters = chapters[1] != "?" ? util.cleanAndParseInt(chapters[1]) : -1;
		}

	
		// TODO: Comments
	
		response.work.stats.kudos = util.cleanAndParseInt($("dd.kudos", "dd.stats").text());
	
		response.work.stats.bookmarks = util.cleanAndParseInt($("dd.bookmarks", "dd.stats").text());

		// TODO: Bookmarks
	
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
	// Chapter(s) Information
	//

	if(response.work.stats.total_chapters != 1)
	{
		response.chapters = [];

		$("#chapters").children().each(function(i, element)
		{
			let titleElement = $(this).find("h3.title");

			let chapterUrl = titleElement.children("a").prop("href");

			let chapterId = parseInt(chapterUrl.split("/")[4]);
			
			let chapterNumber = parseInt(titleElement.children("a").text().substr(8));

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