const WIKI_SEARCH_URL = 'https://en.wikipedia.org/w/api.php';
const WIKI_SUMMARY_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary';

export async function fetchTopicContent(query, mode = 'education') {
  try {
    const searchResults = await searchWikipedia(query);
    if (!searchResults || searchResults.length === 0) {
      return { source: 'none', content: '', title: query };
    }

    const bestMatch = searchResults[0];
    const summary = await getPageSummary(bestMatch.title);

    let fullExtract = summary.extract || '';

    if (fullExtract.length < 1500) {
      const detailed = await getDetailedExtract(bestMatch.title);
      if (detailed && detailed.length > fullExtract.length) fullExtract = detailed;
    }

    return {
      source: 'Wikipedia',
      title: summary.title || bestMatch.title,
      content: fullExtract,
      description: summary.description || '',
      thumbnail: summary.thumbnail?.source || null,
      url: summary.content_urls?.desktop?.page || '',
    };
  } catch (err) {
    console.error('Wikipedia fetch failed:', err.message);
    return { source: 'none', content: '', title: query };
  }
}

async function searchWikipedia(query) {
  const params = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: query,
    srlimit: '3',
    format: 'json',
    origin: '*',
  });

  const res = await fetch(`${WIKI_SEARCH_URL}?${params}`);
  if (!res.ok) throw new Error(`Wiki search failed: ${res.status}`);

  const data = await res.json();
  return data.query?.search || [];
}

async function getPageSummary(title) {
  const encoded = encodeURIComponent(title);
  const res = await fetch(`${WIKI_SUMMARY_URL}/${encoded}`);
  if (!res.ok) throw new Error(`Wiki summary failed: ${res.status}`);
  return res.json();
}

async function getDetailedExtract(title) {
  const params = new URLSearchParams({
    action: 'query',
    prop: 'extracts',
    exintro: '0',
    explaintext: '1',
    exsectionformat: 'plain',
    exchars: '3000',
    titles: title,
    format: 'json',
    origin: '*',
  });

  const res = await fetch(`${WIKI_SEARCH_URL}?${params}`);
  if (!res.ok) return null;

  const data = await res.json();
  const pages = data.query?.pages;
  if (!pages) return null;

  const pageId = Object.keys(pages)[0];
  return pages[pageId]?.extract || null;
}
