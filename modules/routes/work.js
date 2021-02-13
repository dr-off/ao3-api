//
// Dependencies
//

const bent = require("bent");
const cheerio = require("cheerio");

const util = require("./../util");

//
// Locals
//

const getString = bent("https://archiveofourown.org/works/", "string", 200, 
{
	// Cookie required to skip the view adult content warning on AO3
	"Cookie": "view_adult=true;",
});

//
// Exports
//

async function route(context)
{
	let work_id = context.params.work_id;

	let options = {};
	options.include_associations = context.request.query.include_associations != undefined ? context.request.query.include_associations == "true" : true;
	options.include_series = context.request.query.include_series != undefined ? context.request.query.include_series == "true" : true;
	options.include_chapters = context.request.query.include_chapters != undefined ? context.request.query.include_chapters == "true" : true;

	let requestUrl = work_id + "?view_full_work=true";

	let html = await getString(requestUrl);

	let $ = cheerio.load(html);

	let response = {};

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

	// Summary
	{
		let summaryElement = $("#workskin > .preface.group > .summary.module > .userstuff");

		if(summaryElement.length > 0)
			response.work.summary = summaryElement.html().trim();
	}

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
			index: context.data.ao3.ratings[text],
			title: text,
			url: element.children("a").prop("href"),
		}
	}

	// Archive Warnings
	{
		response.work.archiveWarnings = [];
	
		util.populateArrayFromListElement($, response.work.archiveWarnings, "dd.warning.tags > ul > li", context.data.ao3.archiveWarnings);
	}

	// Categories
	{
		response.work.categories = [];

		util.populateArrayFromListElement($, response.work.categories, "dd.category.tags > ul > li", context.data.ao3.categories);
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

		response.work.stats.comments = util.getWorkStatInt($, "dd.comments");
	
		response.work.stats.kudos = util.getWorkStatInt($, "dd.kudos");
	
		response.work.stats.bookmarks = util.getWorkStatInt($, "dd.bookmarks");
	
		response.work.stats.hits = util.getWorkStatInt($, "dd.hits");
	}

	//
	// Associations (if this work has any)
	//

	if(options.include_associations)
	{
		// People this work was gifted to
		let giftees = [];
		// TODO: scary, complicated

		// Inspirations
		let inspirations = [];
		// TODO: scary, complicated

		// Works inpisred by this one (only possible to get on the last chapter or when viewing the full work)
		let childWorks = [];

		let childWorkElements = $("#children > ul > li");

		if(childWorkElements.length > 0)
		{
			childWorkElements.each(function(index, element)
			{
				let childWorkLink = $(this).children().first();

				let childWork = {};

				childWork.work = {};
				childWork.work.id = childWorkLink.prop("href").split("/")[2];
				childWork.work.title = childWorkLink.text();
				childWork.work.url = childWorkLink.prop("href");

				childWork.authors = [];

				$(this).find("a[rel=\"author\"]").each(function(index, element)
				{
					let author = {};

					author.name = $(this).text();
					author.url = $(this).prop("href");

					childWork.authors.push(author);
				});

				childWorks.push(childWork);
			});
		}

		let hasGiftees = giftees.length > 0;
		let hasInspirations = inspirations.length > 0;
		let hasChildWorks = childWorks.length > 0;
		if(hasGiftees || hasInspirations || hasChildWorks)
		{
			response.associations = {};

			if(hasGiftees)
				response.associations.giftees = giftees;

			if(hasInspirations)
				response.associations.inspirations = inspirations;

			if(hasChildWorks)
				response.associations.inspiredWorks = childWorks;
		}
	}

	// 
	// Series (if the work is apart of at least one)
	//

	if(options.include_series)
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
	// Collections
	//

	{
		// TODO
	}

	//
	// Kudos
	//

	{
		// TODO
	}

	//
	// Chapter(s) Information
	//

	if(options.include_chapters && response.work.stats.chapters.total != 1)
	{
		response.chapters = [];

		$("#chapters").children().each(function(i, element)
		{
			let titleElement = $(this).find("h3.title");

			let chapterUrl = titleElement.children("a").prop("href");

			let chapterId = parseInt(chapterUrl.split("/")[4]);
			
			let chapterNumber = parseInt(titleElement.children("a").text().split(" ")[1]);

			let chapterTitle = titleElement.contents().filter((i, element) => element.type == "text").text().trim().substr(2); // Partially taken from https://stackoverflow.com/a/23956052

			let summaryElement = $(this).find(".chapter.preface.group > .summary.module > .userstuff");

			let chapter = {};

			chapter.id = chapterId;

			chapter.number = chapterNumber;

			chapter.title = chapterTitle;

			if(summaryElement.length > 0)
				chapter.summary = summaryElement.html().trim();

			chapter.url = chapterUrl;

			response.chapters.push(chapter);
		});
	}

	context.type = "application/json";
	context.body = JSON.stringify(response);
};

module.exports = route;