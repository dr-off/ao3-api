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

const archiveWarnings =
{
	"Creator Chose Not To Use Archive Warnings": 0,
	"Graphic Depictions Of Violence": 1,
	"Major Character Death": 2,
	"No Archive Warnings Apply": 3,
	"Rape/Non-Con": 4,
	"Underage": 5,
}

const categories =
{
	"F/F": 0,
	"F/M": 1,
	"Gen": 2,
	"M/M": 3,
	"Multi": 4,
	"Other": 5,
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
		// TODO
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
	
		response.work.stats.words = parseInt($("dd.words", "dd.stats").text().trim().replace(",", ""));
	
		// TODO: Chapters
	
		// TODO: Comments
	
		response.work.stats.kudos = parseInt($("dd.kudos", "dd.stats").text().trim().replace(",", ""));
	
		// TODO: Bookmarks
	
		response.work.stats.hits = parseInt($("dd.hits", "dd.stats").text().trim().replace(",", ""));
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
	// Chapter Information (for multi-chapter works)
	//

	if(chapter_id)
	{
		response.chapter = {};

		response.chapter.id = parseInt(chapter_id);

		// TODO: Chapter Title

		response.chapter.url = response.work.url + "/chapters/" + chapter_id;
	}

	context.type = "application/json";
	context.body = JSON.stringify(response);
};

module.exports = route;