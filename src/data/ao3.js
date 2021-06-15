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

//
// Exports
//

module.exports =
{
	ratings: ratings,
	archiveWarnings: archiveWarnings,
	categories: categories,
}