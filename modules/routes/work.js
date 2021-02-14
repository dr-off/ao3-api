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

	let work_id = context.params.work_id;

	//
	// Get Endpoint Options
	//

	let options = {};
	options.include_associations = context.request.query.include_associations != undefined ? context.request.query.include_associations == "true" : true;
	options.include_series = context.request.query.include_series != undefined ? context.request.query.include_series == "true" : true;
	options.include_chapters = context.request.query.include_chapters != undefined ? context.request.query.include_chapters == "true" : true;

	//
	// Assemble Request URL
	//

	let requestUrl = "/works/" + work_id + "?view_full_work=true";

	//
	// Perform the Request (and respond with an error if it fails for some reason)
	//

	let rawResponse;
	try
	{
		rawResponse = await context.axios.get(requestUrl);

		if(rawResponse.request.path == "/users/login?restricted=true")
			throw new Error("This work is only available to registered users of the Archive and, as a result, it is not available through this API");
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

	let $ = context.cheerio.load(html);
	
	//
	// Work Identifiers
	//
	
	response.id = parseInt(work_id);

	response.url = "/works/" + work_id;

	//
	// Work Metadata
	//

	// Title
	{
		response.title = $(".title.heading", "#workskin").text().trim();
	}

	// Authors
	{
		response.authors = [];

		$("#workskin > .preface.group > h3.byline.heading > a").each(function(i, element)
		{
			let author = {};
	
			author.name = $(this).text();
			author.url = $(this).prop("href");
	
			response.authors.push(author);
		});
	}

	// Summary
	{
		let summaryElement = $("#workskin > .preface.group > .summary.module > .userstuff");

		if(summaryElement.length > 0)
			response.summary = summaryElement.html().trim();
	}

	//
	// Work Information Block
	//

	// Rating
	{
		response.rating = undefined;

		let element = $("dd.rating.tags > ul > li").first();
		let text = element.text();

		response.rating =
		{
			index: context.data.ao3.ratings[text],
			url: element.children("a").prop("href"),
			title: text,
		}
	}

	// Archive Warnings
	{
		response.archiveWarnings = [];
	
		context.util.populateArrayFromListElement($, response.archiveWarnings, "dd.warning.tags > ul > li", context.data.ao3.archiveWarnings);
	}

	// Categories
	{
		response.categories = [];

		context.util.populateArrayFromListElement($, response.categories, "dd.category.tags > ul > li", context.data.ao3.categories);
	}

	// Fandoms
	{
		response.fandoms = [];

		context.util.populateArrayFromListElement($, response.fandoms, "dd.fandom.tags > ul > li");
	}

	// Relationships
	{
		response.relationships = [];

		context.util.populateArrayFromListElement($, response.relationships, "dd.relationship.tags > ul > li");
	}

	// Characters
	{
		response.characters = [];

		context.util.populateArrayFromListElement($, response.characters, "dd.character.tags > ul > li");
	}

	// Additional Tags
	{
		response.additionalTags = [];

		context.util.populateArrayFromListElement($, response.additionalTags, "dd.freeform.tags > ul > li");
	}
	
	// Language
	{
		response.language = $("dd.language").text().trim();
	}

	// Stats
	{
		response.stats = {};
	
		response.stats.publication_date = $("dd.published", "dd.stats").text();

		let statusElement = $("dd.status", "dd.stats");

		if(statusElement.length > 0)
			response.stats.last_update_date = statusElement.text();
	
		response.stats.words = context.util.cleanAndParseInt($("dd.words", "dd.stats").text());
	
		let chapters = $("dd.chapters", "dd.stats").text().trim().split("/");
		response.stats.chapters =
		{
			published: context.util.cleanAndParseInt(chapters[0]),
			total: chapters[1] != "?" ? context.util.cleanAndParseInt(chapters[1]) : -1,
		}

		response.stats.comments = context.util.getWorkStatInt($, "dd.comments");
	
		response.stats.kudos = context.util.getWorkStatInt($, "dd.kudos");
	
		response.stats.bookmarks = context.util.getWorkStatInt($, "dd.bookmarks");
	
		response.stats.hits = context.util.getWorkStatInt($, "dd.hits");
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
				childWork.work.url = childWorkLink.prop("href");

				childWork.work.title = childWorkLink.text();

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
				series.url = seriesLink.prop("href");

				series.title = seriesLink.text();

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

	if(options.include_chapters && response.stats.chapters.total != 1)
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

			chapter.url = chapterUrl;

			chapter.number = chapterNumber;

			chapter.title = chapterTitle;

			if(summaryElement.length > 0)
				chapter.summary = summaryElement.html().trim();

			response.chapters.push(chapter);
		});
	}

	//
	// Stringify Response
	//

	context.body = JSON.stringify(response);
};

module.exports = route;