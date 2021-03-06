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

const languages =
{
	"af Soomaali": 64,
	"Afrikaans": 73,
	"العربية": 34,
	"ܐܪܡܝܐ | ארמיא": 118,
	"հայերեն": 160,
	"Bahasa Indonesia": 38,
	"Bahasa Malaysia": 56,
	"Български": 29,
	"বাংলা": 79,
	"Basa Jawa": 130,
	"беларуская": 28,
	"Bosanski": 82,
	"brezhoneg": 103,
	"Català": 4,
	"Čeština": 5,
	"Chinuk Wawa": 98,
	"Cymraeg": 43,
	"Dansk": 6,
	"Deutsch": 7,
	"eesti keel": 51,
	"Ελληνικά": 27,
	"English": 1,
	"Español": 9,
	"Esperanto": 45,
	"Euskara": 112,
	"فارسی": 2,
	"Filipino": 26,
	"Français": 8,
	"Furlan": 148,
	"Gaeilge": 10,
	"Gàidhlig": 42,
	"Galego": 93,
	"𐌲𐌿𐍄𐌹𐍃𐌺𐌰": 115,
	"中文-客家话": 145,
	"한국어": 35,
	"Hausa | هَرْشَن هَوْسَ": 157,
	"हिन्दी": 37,
	"Hrvatski": 11,
	"Interlingua": 84,
	"isiZulu": 127,
	"Íslenska": 12,
	"Italiano": 13,
	"עברית": 33,
	"ქართული": 106,
	"Khuzdul": 76,
	"Кыргызча": 165,
	"Kiswahili": 58,
	"kreyòl ayisyen": 173,
	"Langue des signes québécoise": 109,
	"Latviešu valoda": 14,
	"Lëtzebuergesch": 87,
	"Lietuvių kalba": 15,
	"Lingua latina": 41,
	"Magyar": 16,
	"македонски": 100,
	"മലയാളം": 95,
	"ᠮᠠᠨᠵᡠ ᡤᡳᠰᡠᠨ": 151,
	"मराठी": 46,
	"ᠮᠣᠩᠭᠣᠯ ᠪᠢᠴᠢᠭ᠌ | Монгол Кирилл үсэг": 152,
	"မြန်မာဘာသာ": 168,
	"中文-闽南话 臺語": 136,
	"Nederlands": 17,
	"日本語": 36,
	"Norsk": 18,
	"پښتو": 162,
	"Plattdüütsch": 70,
	"Polski": 19,
	"Português brasileiro": 20,
	"Português europeu": 65,
	"ਪੰਜਾਬੀ": 3,
	"Quenya": 50,
	"Română": 21,
	"Русский": 30,
	"Scots": 133,
	"Shqip": 22,
	"Sindarin": 75,
	"සිංහල": 121,
	"Slovenčina": 53,
	"Slovenščina": 72,
	"Sprēkō Þiudiskō": 69,
	"српски": 31,
	"Suomi": 23,
	"Svenska": 25,
	"தமிழ்": 90,
	"ไทย": 47,
	"Thermian": 48,
	"བོད་སྐད་": 155,
	"Tiếng Việt": 44,
	"tlhIngan-Hol": 49,
	"Toki Pona": 124,
	"Türkçe": 24,
	"Українська": 32,
	"ئۇيغۇر تىلى": 154,
	"中文-吴语": 142,
	"יידיש": 171,
	"中文-广东话 粵語": 139,
	"中文-普通话 國語": 40,
};

//
// Exports
//

module.exports =
{
	ratings: ratings,
	archiveWarnings: archiveWarnings,
	categories: categories,
	languages: languages,
}