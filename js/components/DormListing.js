const listingStyles = document.createElement('link');
listingStyles.rel = 'stylesheet';
listingStyles.href = new URL('../../css/listing.css', document.currentScript.src).href;
document.head.appendChild(listingStyles);

class DormListing extends HTMLElement {
  connectedCallback() {
    const data = {
      name: this.getAttribute('name') || 'Unknown dorm',
      price: this.getAttribute('price') || '',
      distance: this.getAttribute('distance') || '',
      roommates: this.getAttribute('roommates') || '',
      roomtype: this.getAttribute('roomtype') || '',
      available: this.getAttribute('available') || '',
      utilities: this.getAttribute('utilities') || '',
      rating: this.getAttribute('rating') || '',
      reviews: this.getAttribute('reviews') || '',
      furnished: this.getAttribute('furnished') || '',
      listedBy: this.getAttribute('listed-by') || '',
      image: this.getAttribute('image') || ''
    };

    const wrapper = document.createElement('article');
    wrapper.className = 'dorm-listing';

    if (data.image) {
      const img = document.createElement('img');
      img.src = data.image;
      img.alt = `${data.name} image`;
      wrapper.appendChild(img);
    }

    const info = document.createElement('div');
    info.className = 'dorm-listing-info';

    info.appendChild(this._createText('h3', data.name));
    if (data.price) info.appendChild(this._createText('p', data.price));
    if (data.distance) info.appendChild(this._createText('p', data.distance));
    if (data.roommates) info.appendChild(this._createText('p', `${data.roommates} roommates`));
    if (data.roomtype) info.appendChild(this._createText('p', data.roomtype));
    if (data.available) info.appendChild(this._createText('p', `Available ${data.available}`));
    if (data.utilities) info.appendChild(this._createText('p', data.utilities));

    if (data.rating || data.reviews) {
      const ratingText = [data.rating, data.reviews].filter(Boolean).join(' ');
      info.appendChild(this._createText('p', ratingText));
    }

    if (data.furnished) info.appendChild(this._createText('p', data.furnished));
    if (data.listedBy) info.appendChild(this._createText('p', `Listed by: ${data.listedBy}`));

    wrapper.appendChild(info);
    this.appendChild(wrapper);
  }

  _createText(tag, text) {
    const element = document.createElement(tag);
    element.textContent = text;
    return element;
  }
}

customElements.define('dorm-listing', DormListing);
