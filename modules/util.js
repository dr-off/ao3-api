//
// Exports
//

const util = {};

util.cleanAndParseInt = function(text)
{
	return parseInt(text.trim().replace(",", ""));
}

module.exports = util;