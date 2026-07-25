const listingPages = {
  'stong-residence': 'listing.html',
  'four-winds-townhouse': 'listing2.html',
  'the-quad-yorku': 'listing3.html'
};

let cachedListings = null;

function formatPrice(priceCents, pricePeriod) {
  const price = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0
  }).format(Number(priceCents) / 100);

  return `${price} / ${pricePeriod}`;
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function setMessage(element, message) {
  if (!element) return;
  element.textContent = message;
  element.hidden = message.length === 0;
}

function readFilters(form) {
  const formData = new FormData(form);
  const params = new URLSearchParams(window.location.search);

  return {
    query: String(formData.get('query') || params.get('query') || '').trim(),
    location: String(formData.get('location') || '').trim(),
    maxPrice: Number(formData.get('max-price')),
    roommates: formData.get('roommates') === '' ? null : Number(formData.get('roommates')),
    kitchen: formData.get('kitchen') === 'on'
  };
}

function validateFilters(filters) {
  const errors = [];

  if (filters.query && filters.query.length < 2) {
    errors.push('Keyword must be at least 2 characters.');
  }

  if (filters.location && filters.location.length < 2) {
    errors.push('Location must be at least 2 characters.');
  }

  if (!Number.isInteger(filters.maxPrice) || filters.maxPrice < 300 || filters.maxPrice > 2000) {
    errors.push('Max price must be between $300 and $2000.');
  }

  if (filters.roommates !== null && (!Number.isInteger(filters.roommates) || filters.roommates < 0 || filters.roommates > 3)) {
    errors.push('Number of roommates must be a whole number from 0 to 3.');
  }

  return errors;
}

function populateFormFromUrl(form) {
  const params = new URLSearchParams(window.location.search);

  if (form.elements.query) {
    form.elements.query.value = params.get('query') || '';
  }
  form.elements.location.value = params.get('location') || '';
  form.elements['max-price'].value = params.get('max-price') || '2000';
  form.elements.roommates.value = params.get('roommates') || '';
  form.elements.kitchen.checked = params.get('kitchen') === 'on';
}

function updatePriceOutput(input, output) {
  if (!input || !output) return;
  output.textContent = `$${Number(input.value).toLocaleString('en-CA')}`;
}

function getSearchableText(listing, fields) {
  return fields
    .flatMap((field) => listing[field] || [])
    .join(' ')
    .toLowerCase();
}

function matchesFilters(listing, filters) {
  const keywordText = getSearchableText(listing, [
    'name', 'location', 'description', 'room_type', 'availability_note', 'listed_by', 'amenities'
  ]);
  const locationText = getSearchableText(listing, ['name', 'location', 'description']);

  if (filters.query && !keywordText.includes(normalize(filters.query))) return false;
  if (filters.location && !locationText.includes(normalize(filters.location))) return false;
  if (Number(listing.price_cents) > filters.maxPrice * 100) return false;
  if (filters.kitchen && listing.has_kitchen !== true) return false;

  if (filters.roommates !== null) {
    const listingRoommates = Number(listing.max_roommates);
    if (!Number.isFinite(listingRoommates) || listingRoommates > filters.roommates) return false;
  }

  return true;
}

function createTextElement(tag, text) {
  const element = document.createElement(tag);
  element.textContent = text;
  return element;
}

function createListingTitle(listing) {
  const title = document.createElement('h3');
  const pageUrl = listingPages[listing.slug];

  if (!pageUrl) {
    title.textContent = listing.name;
    return title;
  }

  const link = document.createElement('a');
  link.href = pageUrl;
  link.textContent = listing.name;
  title.appendChild(link);
  return title;
}

function createListingCard(listing) {
  const card = document.createElement('article');
  card.className = 'listing-card';

  if (listing.image_url) {
    const image = document.createElement('img');
    image.src = listing.image_url;
    image.alt = listing.image_alt || listing.name;
    image.width = 300;
    image.height = 200;
    card.appendChild(image);
  }

  const info = document.createElement('div');
  info.appendChild(createListingTitle(listing));
  info.appendChild(createPriceElement(listing));
  appendListingDetails(info, listing);
  card.appendChild(info);
  return card;
}

function createPriceElement(listing) {
  const price = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = formatPrice(listing.price_cents, listing.price_period);
  price.appendChild(strong);
  return price;
}

function appendListingDetails(container, listing) {
  const hasDistance = listing.distance_km !== null && listing.distance_km !== undefined;
  const distance = hasDistance ? `${listing.distance_km} km from campus` : '';
  const details = [
    listing.location,
    distance,
    listing.room_type,
    listing.has_kitchen ? 'Kitchen included' : '',
    listing.utilities_included ? 'Utilities included' : '',
    listing.furnished ? 'Furnished' : '',
    listing.availability_note
  ].filter(Boolean);

  details.forEach((detail) => container.appendChild(createTextElement('p', detail)));
}

async function fetchListings() {
  if (cachedListings) return cachedListings;

  const config = window.DormScopeConfig;
  if (!config?.supabaseUrl || !config?.supabasePublishableKey) {
    throw new Error('Supabase config could not be found.');
  }

  const url = new URL('/rest/v1/listings', config.supabaseUrl);
  url.searchParams.set('select', '*');
  url.searchParams.set('order', 'price_cents.asc');

  const response = await fetch(url, {
    headers: {
      apikey: config.supabasePublishableKey,
      Authorization: `Bearer ${config.supabasePublishableKey}`
    }
  });

  if (!response.ok) throw new Error('Could not load dorm listings.');
  cachedListings = await response.json();
  return cachedListings;
}

function updateUrl(filters) {
  const params = new URLSearchParams();

  if (filters.query) params.set('query', filters.query);
  if (filters.location) params.set('location', filters.location);
  if (filters.maxPrice !== 2000) params.set('max-price', String(filters.maxPrice));
  if (filters.roommates !== null) params.set('roommates', String(filters.roommates));
  if (filters.kitchen) params.set('kitchen', 'on');

  const nextUrl = params.toString() ? `${location.pathname}?${params}` : location.pathname;
  window.history.replaceState(null, '', nextUrl);
}

function renderResults(listings, filters, elements) {
  const matches = listings.filter((listing) => matchesFilters(listing, filters));
  elements.results.replaceChildren();

  if (matches.length === 0) {
    setMessage(elements.status, 'No dorms match those filters. Try a broader search.');
    return;
  }

  setMessage(elements.status, `Showing ${matches.length} dorm listing${matches.length === 1 ? '' : 's'}.`);
  matches.forEach((listing, index) => {
    elements.results.appendChild(createListingCard(listing));
    if (index < matches.length - 1) elements.results.appendChild(document.createElement('hr'));
  });
}

async function runSearch(filters, elements) {
  const errors = validateFilters(filters);
  elements.results.replaceChildren();

  if (errors.length > 0) {
    setMessage(elements.error, errors.join(' '));
    setMessage(elements.status, 'Fix the search form errors, then try again.');
    return;
  }

  setMessage(elements.error, '');
  setMessage(elements.status, 'Loading dorm listings...');

  try {
    renderResults(await fetchListings(), filters, elements);
  } catch (error) {
    setMessage(elements.status, 'Dorm listings could not be loaded. Please try again later.');
    console.error(error);
  }
}

function initSearch() {
  const elements = {
    form: document.querySelector('#search-form'),
    results: document.querySelector('#search-results-list'),
    status: document.querySelector('#search-status'),
    error: document.querySelector('#search-error')
  };

  if (!elements.form || !elements.results) return;

  populateFormFromUrl(elements.form);

  const maxPriceInput = elements.form.elements['max-price'];
  const maxPriceOutput = document.querySelector('#max-price-value');
  updatePriceOutput(maxPriceInput, maxPriceOutput);
  maxPriceInput.addEventListener('input', () => updatePriceOutput(maxPriceInput, maxPriceOutput));

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const filters = readFilters(elements.form);
    updateUrl(filters);
    runSearch(filters, elements);
  });

  runSearch(readFilters(elements.form), elements);
}

document.addEventListener('DOMContentLoaded', initSearch);
