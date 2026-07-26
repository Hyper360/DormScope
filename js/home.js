// build one dorm card
function makeCard(listing) {
  const image = listing.image_url
    ? `<img src="${escapeHtml(listing.image_url)}" alt="${escapeHtml(listing.image_alt || listing.name)}" width="300" height="200">`
    : '';
  const details = [
    listing.location,
    listing.room_type,
    listing.utilities_included ? 'Utilities included' : '',
    listing.furnished ? 'Furnished' : '',
    listing.availability_note
  ].filter(Boolean).map((detail) => `<p>${escapeHtml(detail)}</p>`).join('');

  return `
    <article class="listing-card">
      ${image}
      <h3><a href="listing.html?id=${encodeURIComponent(listing.id)}">${escapeHtml(listing.name)}</a></h3>
      <p><strong>${showPrice(listing.price_cents, listing.price_period)}</strong></p>
      ${details}
    </article>
  `;
}

async function loadFeaturedListings() {
  const box = document.querySelector('#featured-listings');
  const config = window.DormScopeConfig;
  const url = `${config.supabaseUrl}/rest/v1/listings?select=*&order=created_at.desc`;

  try {
    const response = await fetch(url, {
      headers: {
        apikey: config.supabasePublishableKey,
        Authorization: `Bearer ${config.supabasePublishableKey}`
      }
    });

    if (!response.ok) throw new Error('Could not load listings.');

    const listings = await response.json();
    // pick a few at random
    const featured = listings.sort(() => Math.random() - 0.5).slice(0, 4);

    if (featured.length === 0) {
      box.innerHTML = '<h2>Featured Dorms</h2><p>No dorm listings are available yet.</p>';
      return;
    }

    const cards = featured.map(makeCard).join('<hr>');
    box.innerHTML = `<h2>Featured Dorms</h2>${cards}`;
  } catch (error) {
    box.innerHTML = '<h2>Featured Dorms</h2><p>Featured dorms could not be loaded. Please try again later.</p>';
    console.error(error);
  }
}

loadFeaturedListings();