//
// Exports
//

const util = {};

util.cleanAndParseInt(text)
{
	return parseInt(text.trim().replace(",", ""));
}

module.exports = util;