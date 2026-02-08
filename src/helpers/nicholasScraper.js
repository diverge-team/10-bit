const cheerio = require('cheerio');

const WIKI_EN_BASE = 'https://wiki.guildwars.com';
const WIKI_FR_URL = 'https://www.gwiki.fr/wiki/Accueil';

/**
 * Scrapes the French wiki homepage for Nicholas info (French names)
 * @returns {Promise<{traveler: {item: string, location: string, quantity: number}, sandford: {item: string, quantity: number}}>}
 */
async function scrapeWikiFR() {
	try {
		const response = await fetch(WIKI_FR_URL, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (compatible; DiscordBot/1.0)',
			},
		});
		const html = await response.text();
		const $ = cheerio.load(html);

		let traveler = { item: '', location: '', quantity: 1 };
		let sandford = { item: '', quantity: 5 };

		// Find Nicholas le Voyageur section
		$('a[href*="Nicholas_le_Voyageur"]').each((i, el) => {
			const parent = $(el).parent();
			const text = parent.text();

			// Extract quantity and item: "Nicholas le Voyageur : 1 Doublon d'or (Côte Barbare)"
			const match = text.match(/Nicholas le Voyageur\s*:\s*(\d+)\s+([^(]+)\s*\(([^)]+)\)/i);
			if (match) {
				traveler.quantity = parseInt(match[1], 10);
				traveler.item = match[2].trim();
				traveler.location = match[3].trim();
			}
		});

		// Find Nicholas Sandford section
		$('a[href*="Nicholas_Sandford"]').each((i, el) => {
			const parent = $(el).parent();
			const text = parent.text();

			// Extract quantity and item: "Nicholas Sandford : 5 Gravure de Charr"
			const match = text.match(/Nicholas Sandford\s*:\s*(\d+)\s+(.+)/i);
			if (match) {
				sandford.quantity = parseInt(match[1], 10);
				sandford.item = match[2].trim();
			}
		});

		return { traveler, sandford };
	} catch (error) {
		console.error('Error scraping French wiki:', error);
		return {
			traveler: { item: '', location: '', quantity: 1 },
			sandford: { item: '', quantity: 5 },
		};
	}
}

/**
 * Scrapes the English wiki for Nicholas the Traveler links (item URL + location map URL)
 * @returns {Promise<{itemUrl: string|null, locationUrl: string|null, mapUrl: string|null}>}
 */
async function scrapeWikiEN_Traveler() {
	try {
		const response = await fetch(`${WIKI_EN_BASE}/wiki/Nicholas_the_Traveler`, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (compatible; DiscordBot/1.0)',
			},
		});
		const html = await response.text();
		const $ = cheerio.load(html);

		let itemUrl = null;
		let locationUrl = null;
		let mapUrl = null;
		let locationName = '';

		// Find the current week info - look for "collecting" pattern in links
		const contentHtml = $('#mw-content-text').html() || '';

		// Find location link (appears before "collecting")
		const locationPattern = /<a[^>]+href="(\/wiki\/[^"]+)"[^>]*title="([^"]+)"[^>]*>([^<]+)<\/a>[^<]*collecting/gi;
		const locationMatch = locationPattern.exec(contentHtml);
		if (locationMatch) {
			locationUrl = WIKI_EN_BASE + locationMatch[1];
			locationName = locationMatch[3].trim().replace(/ /g, '_');
		}

		// Find item link (appears after "collecting X")
		const itemPattern = /collecting\s+\d+\s+<a[^>]+href="(\/wiki\/[^"]+)"[^>]*>([^<]+)<\/a>/gi;
		const itemMatch = itemPattern.exec(contentHtml);
		if (itemMatch) {
			itemUrl = WIKI_EN_BASE + itemMatch[1];
		}

		// Build map URL based on location name
		if (locationName) {
			mapUrl = `${WIKI_EN_BASE}/wiki/File:Nicholas_the_Traveler_${locationName}_map.jpg`;
		}

		return { itemUrl, locationUrl, mapUrl };
	} catch (error) {
		console.error('Error scraping English wiki for Traveler:', error);
		return { itemUrl: null, locationUrl: null, mapUrl: null };
	}
}

/**
 * Scrapes the English wiki for Nicholas Sandford item link
 * @returns {Promise<{itemUrl: string|null}>}
 */
async function scrapeWikiEN_Sandford() {
	try {
		const response = await fetch(`${WIKI_EN_BASE}/wiki/Nicholas_Sandford`, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (compatible; DiscordBot/1.0)',
			},
		});
		const html = await response.text();
		const $ = cheerio.load(html);

		let itemUrl = null;

		// Find "currently looking for" link
		const contentHtml = $('#mw-content-text').html() || '';
		const itemPattern = /currently looking for[:\s]+<a[^>]+href="(\/wiki\/[^"]+)"[^>]*>/i;
		const itemMatch = itemPattern.exec(contentHtml);
		if (itemMatch) {
			itemUrl = WIKI_EN_BASE + itemMatch[1];
		}

		return { itemUrl };
	} catch (error) {
		console.error('Error scraping English wiki for Sandford:', error);
		return { itemUrl: null };
	}
}

/**
 * Fetches Nicholas the Traveler info from both wikis
 * @returns {Promise<{item: string, location: string, quantity: number, itemUrl: string|null, locationUrl: string|null, mapUrl: string|null}>}
 */
async function getNicholasTraveler() {
	const [frData, enData] = await Promise.all([
		scrapeWikiFR(),
		scrapeWikiEN_Traveler(),
	]);

	return {
		item: frData.traveler.item || 'Inconnu',
		location: frData.traveler.location || 'Inconnue',
		quantity: frData.traveler.quantity,
		itemUrl: enData.itemUrl,
		locationUrl: enData.locationUrl,
		mapUrl: enData.mapUrl,
	};
}

/**
 * Fetches Nicholas Sandford info from both wikis
 * @returns {Promise<{item: string, quantity: number, itemUrl: string|null}>}
 */
async function getNicholasSandford() {
	const [frData, enData] = await Promise.all([
		scrapeWikiFR(),
		scrapeWikiEN_Sandford(),
	]);

	return {
		item: frData.sandford.item || 'Inconnu',
		quantity: frData.sandford.quantity,
		itemUrl: enData.itemUrl,
	};
}

/**
 * Gets both Nicholas the Traveler and Nicholas Sandford info
 * @returns {Promise<{traveler: object, sandford: object}>}
 */
async function getAllNicholasInfo() {
	const frData = await scrapeWikiFR();
	const [enTraveler, enSandford] = await Promise.all([
		scrapeWikiEN_Traveler(),
		scrapeWikiEN_Sandford(),
	]);

	return {
		traveler: {
			item: frData.traveler.item || 'Inconnu',
			location: frData.traveler.location || 'Inconnue',
			quantity: frData.traveler.quantity,
			itemUrl: enTraveler.itemUrl,
			locationUrl: enTraveler.locationUrl,
			mapUrl: enTraveler.mapUrl,
		},
		sandford: {
			item: frData.sandford.item || 'Inconnu',
			quantity: frData.sandford.quantity,
			itemUrl: enSandford.itemUrl,
		},
	};
}

module.exports = {
	getNicholasTraveler,
	getNicholasSandford,
	getAllNicholasInfo,
};
