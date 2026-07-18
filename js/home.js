function formatPrice(priceCents, pricePeriod) {
  const price = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0
  }).format(priceCents / 100);

  return `${price} / ${pricePeriod}`;
}

function randomListings(listings, count) {
  return [...listings]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
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

  const title = document.createElement('h3');
  title.textContent = listing.name;
  card.appendChild(title);

  const price = document.createElement('p');
  const priceText = document.createElement('strong');
  priceText.textContent = formatPrice(listing.price_cents, listing.price_period);
  price.appendChild(priceText);
  card.appendChild(price);

  const details = [
    listing.location,
    listing.room_type,
    listing.utilities_included ? 'Utilities included' : '',
    listing.furnished ? 'Furnished' : '',
    listing.availability_note
  ].filter(Boolean);

  details.forEach((detail) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = detail;
    card.appendChild(paragraph);
  });

  return card;
}

async function loadFeaturedListings() {
  const container = document.querySelector('#featured-listings');
  const { supabaseUrl, supabasePublishableKey } = window.DormScopeConfig;

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/listings?select=*&order=created_at.desc`,
      {
        headers: {
          apikey: supabasePublishableKey,
          Authorization: `Bearer ${supabasePublishableKey}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Could not load listings.');
    }

    const listings = await response.json();
    const featuredListings = randomListings(listings, 4);
    container.replaceChildren();

    if (featuredListings.length === 0) {
      container.textContent = 'No dorm listings are available yet.';
      return;
    }

    featuredListings.forEach((listing, index) => {
      container.appendChild(createListingCard(listing));

      if (index < featuredListings.length - 1) {
        container.appendChild(document.createElement('hr'));
      }
    });
  } catch (error) {
    container.textContent = 'Featured dorms could not be loaded. Please try again later.';
    console.error(error);
  }
}

loadFeaturedListings();