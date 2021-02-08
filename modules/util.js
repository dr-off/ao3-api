//
// Dependencies
//

const cheerio = require("cheerio"); // For JSDoc Comments

//
// Exports
//

const util = {};

/**
 * Removes commas from a string and tries to parse an int out of it.
 * 
 * @param {String} text A string of a number like "100" or "1,234,567".
 */
util.cleanAndParseInt = function(text)
{
	return parseInt(text.trim().replace(",", ""));
}

/**
 * Populates an array from a list element selected with the given selector.
 * 
 * @param {cheerio.Root} $ A cheerio Root instance.
 * @param {Array} listArray The array to populate from the list element.
 * @param {String} listElementSelector The selector for the list element.
 * @param {Object} indexLookupObject 
 */
util.populateArrayFromListElement = function($, listArray, listElementSelector, indexLookupObject)
{
	$(listElementSelector).each(function(i, element)
	{
		let text = $(this).text();

		let entry = {};

		if(indexLookupObject != undefined)
			entry.index = indexLookupObject[text];

		entry.name = text;
		entry.url = $(this).children("a").prop("href");

		listArray.push(entry);
	});
}

/**
 * Gets a work statistic as an integer.
 * 
 * @param {cheerio.Root} $ A cheerio Root instance.
 * @param {String} elementSelector The selector for the stat element.
 */
util.getWorkStatInt = function($, elementSelector)
{
	let statElement = $(elementSelector, "dd.stats");

	return statElement.length > 0 ? util.cleanAndParseInt(statElement.text()) : 0;
}

module.exports = util;