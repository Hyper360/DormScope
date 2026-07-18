function makeList(title, items) {
  if (!items || items.length === 0) return '';

  const listItems = items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  return `<section><h2>${escapeHtml(title)}</h2><ul>${listItems}</ul></section>`;
}

function makeReviews(reviews) {
  if (reviews.length === 0) return '<section><h2>Reviews</h2><p>No reviews yet.</p></section>';

  const reviewItems = reviews.map((review) => `
    <div class="review-item">
      <strong>${escapeHtml(review.author_name)} - ${escapeHtml(review.rating)}★</strong>
      <p>${escapeHtml(review.comment)}</p>
    </div>
  `).join('');

  return `<section><h2>Reviews</h2>${reviewItems}</section>`;
}

function getDetails(listing) {
  if (listing.summary_details && listing.summary_details.length > 0) {
    return listing.summary_details;
  }

  const details = [];
  if (listing.distance_km !== null && listing.distance_km !== undefined) {
    details.push(`${listing.distance_km} km from ${listing.location}`);
  }
  if (listing.room_type) details.push(listing.room_type);
  if (listing.availability_note) details.push(listing.availability_note);
  if (listing.utilities_included) details.push('Utilities included');
  if (listing.furnished) details.push('Furnished');
  return details;
}

function showListing(content, listing, reviews) {
  const image = listing.image_url
    ? `<img src="${escapeHtml(listing.image_url)}" alt="${escapeHtml(listing.image_alt || listing.name)}">`
    : '';
  const details = getDetails(listing).map((detail) => `<p>${escapeHtml(detail)}</p>`).join('');
  const rating = reviews.length > 0
    ? `<p>${(reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1)}★ (${reviews.length} reviews)</p>`
    : '';
  const listedBy = listing.listed_by ? `<p>Listed by: ${escapeHtml(listing.listed_by)}</p>` : '';
  const utilities = listing.utilities && listing.utilities.length > 0 ? listing.utilities : listing.amenities;
  const amenities = listing.utilities && listing.utilities.length > 0 ? listing.amenities : [];

  content.innerHTML = `
    <p><a href="search.html">Back to search</a></p>
    <section class="listing-hero">
      ${image}
      <div class="listing-summary">
        <h1>${escapeHtml(listing.name)}</h1>
        <p><strong>${showPrice(listing.price_cents, listing.price_period)}</strong></p>
        ${details}
        ${rating}
        ${listedBy}
        <p><a class="button" href="rate_dorm.html?slug=${encodeURIComponent(listing.slug)}">Rate this dorm</a></p>
      </div>
    </section>
    <section>
      <h2>Description</h2>
      <p>${escapeHtml(listing.description)}</p>
    </section>
    ${makeList('Utilities', utilities)}
    ${makeList('Amenities', amenities)}
    ${makeList('House Rules', listing.house_rules)}
    ${makeReviews(reviews)}
  `;
}

async function getData(url) {
  const key = window.DormScopeConfig.supabasePublishableKey;
  const response = await fetch(url, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }
  });

  if (!response.ok) throw new Error('Could not load listing data.');
  return response.json();
}

async function loadListing() {
  const content = document.querySelector('#listing-content');
  const query = new URLSearchParams(window.location.search);
  let id = query.get('id');
  let slug = query.get('slug');

  if (!id && !slug) {
    slug = 'stong-residence';
    const defaultUrl = new URL(window.location.href);
    defaultUrl.searchParams.set('slug', slug);
    window.history.replaceState({}, '', defaultUrl);
  }

  const config = window.DormScopeConfig;
  const search = id ? `id=eq.${id}` : `slug=eq.${slug}`;

  try {
    const listings = await getData(`${config.supabaseUrl}/rest/v1/listings?select=*&${search}`);
    const listing = listings[0];

    if (!listing) {
      content.textContent = 'This listing could not be found.';
      return;
    }

    const reviews = await getData(
      `${config.supabaseUrl}/rest/v1/reviews?select=*&listing_id=eq.${listing.id}&order=created_at.desc`
    );

    document.title = `Dorm Scope | ${listing.name}`;
    showListing(content, listing, reviews);
  } catch (error) {
    content.textContent = 'Listing details could not be loaded. Please try again later.';
    console.error(error);
  }
}

loadListing();