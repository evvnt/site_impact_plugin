class AudienceSelector {
  constructor(element) {
    console.debug('\tSiteImpact AudienceSelector');
    this.element = element;
    this.audienceOptions = JSON.parse(element.dataset.audienceOptions);
    this.audienceReadyUrl = element.dataset.audienceReadyUrl;
    this.zipCode = element.dataset.zipCode;
    this.formattedAddress = '';
    this.cpm = element.dataset.cpm
    this.maxRadius = element.dataset.maxRadius;
    this.selectedCountId = element.dataset.selectedCountId;
    this.selectedAudienceSize = element.dataset.selectedAudienceSize;
    this.amountInCents = element.dataset.priceInCents;
    this.markers = {}

    this.slider = element.querySelector('#v-audience_selector_slider').vComponent;
    this.subscriberCount = element.querySelector('.subscriber-count');
    this.subscriberLocationMsg = element.querySelector('.subscriber-location-message');
    this.subscriberRadiusMsg = element.querySelector('.subscriber-radius-message');

    let externalPriceElementId = element.dataset.externalPriceElement;
    this.priceDisplay = document.querySelector('#' + externalPriceElementId);
    this.currencyCode = element.dataset.currencyCode;

    element.querySelector('#v-audience_selector_slider').addEventListener('MDCSlider:change', this.updateSlider.bind(this));

    if (this.audienceReadyUrl) {
      this.pollForReady().then(r => {
        this.audienceOptions = r.audience_options;
        this.initMap().then(r => console.log('map initialized'));
      });
    } else {
      this.initMap().then(r => console.log('map initialized'));
    }
  }

  async pollForReady() {
    let result = await this.getAudienceStatus();
    console.dir(result);
    while (result.ready !== true) {
      await this.wait();
      result = await this.getAudienceStatus();
    }
    return result;
  }

  wait(ms = 1000) {
    return new Promise(resolve => {
      console.log(`waiting ${ms} ms...`);
      setTimeout(resolve, ms);
    });
  }

  getAudienceStatus() {
    const httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', this.audienceReadyUrl, false);
    let response = {ready: false};
    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState === XMLHttpRequest.DONE){
        response =  JSON.parse(httpRequest.response);
      } else {
        console.log(`Error ${httpRequest.status}: ${httpRequest.statusText}`);
      }
    };
    httpRequest.setRequestHeader('X-NO-LAYOUT', true);
    httpRequest.send();
    console.dir(response);
    return response;
  }

  prepareSubmit(params) {
    params.push(['selected_event_email_campaign_count_id', this.selectedCountId]);
    params.push(['selected_audience_size', this.selectedAudienceSize]);
    params.push(['amount_in_cents', this.amountInCents]);
    params.push(['location_description', this.formattedAddress])
  }

  async initMap() {
    const {Geocoder} = await google.maps.importLibrary("geocoding");
    const {Map} = await google.maps.importLibrary("maps");
    this.element.querySelector('#v-audience-selector-container').classList.remove('v-hidden');
    this.element.querySelector('#v-audience-ready-container').classList.add('v-hidden');
    this.map = new google.maps.Map(this.element.querySelector('#audience-selector-map'), {
      zoom: this.zoom(),
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false
    });

    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': this.zipCode})
      .then((result) => {
        const { results } = result;
        this.mapCenter = results[0].geometry.location;
        this.map.setCenter(results[0].geometry.location);
        this.formattedAddress = results[0].formatted_address
        this.createMarkers();
        this.updateSlider();
      })
      .catch((e) => {
        console.log('Geocode was not successful for the following reason: ' + e);
      });

    this.centreOfUsaCoordinates = new google.maps.LatLng(39.833333, -98.585522);
  }

  // Update the current slider value (each time you drag the slider handle)
  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  zoom() {
    if (this.radius() == 0) {
      return 14;
    }
    if (this.radius() <= 1) {
      return 13;
    }
    if (this.radius() <= 3) {
      return 12;
    }
    if (this.radius() <= 5) {
      return 11;
    }
    if (this.radius() <= 10) {
      return 10;
    }
    if (this.radius() <= 20) {
      return 9;
    }
    if (this.radius() <= 50) {
      return 8;
    }
    if (this.radius() <= this.maxRadius) {
      return 7;
    }

    return 4;
  }

  mapCenterCoordinates() {
    if (this.radius() > this.maxRadius) {
      return this.centreOfUsaCoordinates ;
    }
    return this.mapCenter;
  }

  radius() {
    let value = this.slider.value();
    return this.audienceOptions[value].radius;
  }

  updateSlider() {
    let value = this.slider.value();
    let radius = this.radius();
    let count = this.audienceOptions[value].count;

    this.selectedCountId = this.audienceOptions[value].email_campaign_count_id;
    this.selectedAudienceSize = count;
    this.amountInCents = (count * this.cpm) / 1000;

    if (radius > this.maxRadius) {
      this.subscriberLocationMsg.innerHTML = "'Opt-in' subscribers in the USA <span>&nbsp;</span>"
    }
    else {
      let loc = (radius > 0) ? "located within " + radius + " miles of zip code " + this.zipCode : "located in zip code " + this.zipCode;
      this.subscriberLocationMsg.innerHTML = "'Opt-in' subscribers in or near " + this.formattedAddress;
      this.subscriberRadiusMsg.innerHTML = "(" + loc + ")";
    }

    this.subscriberCount.innerHTML = this.numberWithCommas(count);
    if (this.priceDisplay) {
      let currencyFormat = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: this.currencyCode,
      });
      this.priceDisplay.innerHTML = currencyFormat.format(this.amountInCents / 100);
    }

    if (this.map) {
      if (this.map.getZoom() !== this.zoom()) {
        // Clear all markers and start again.
        for (let radiusEach in this.markers) {
          for (let i = 0; i < this.markers[radiusEach].length; i++) {
            if (this.markers[radiusEach] && this.markers[radiusEach][i]) {
              this.markers[radiusEach][i].setMap(null);
            }
          }
        }
      }

      this.map.setZoom(this.zoom());
      this.map.setCenter(this.mapCenterCoordinates());

      let markerCount = (this.radius() > this.maxRadius) ? count / 50 : count / 10;

      // Now show only the right number of markers
      for (let i = 0; i < this.markers[radius].length; i ++) {
        if (this.markers[radius] && this.markers[radius][i]) {
          if (i < markerCount) {
            this.markers[radius][i].setMap(this.map);
          }
          else {
            this.markers[radius][i].setMap(null);
          }
        }
      }
    }
  }

  getIcon() {
    const icon = (Math.random() < 0.5) ? 'man.png' : 'woman.png';
    return 'http://maps.google.com/mapfiles/ms/micons/' + icon;
  }

  createMarkers() {
    let radii = [];
    for (let i = 0; i < this.audienceOptions.length; i ++) {
      if (radii.indexOf(this.audienceOptions[i].radius) === -1) {
        radii.push(this.audienceOptions[i].radius);
      }
    }

    for (var i = 0; i < radii.length; i++) {
      this.markers[radii[i]] = this.createMarkersForRadius(radii[i]);
    }
  }

  getMaxCountFromRadius(radius) {
    let maxFound = 0;
    for (var i = 0; i < this.audienceOptions.length; i ++) {
      if (this.audienceOptions[i].radius === radius && this.audienceOptions[i].count > maxFound) {
        maxFound = this.audienceOptions[i].count;
      }
    }
    return maxFound;
  }

  createMarkersForRadius(radius) {
    if (radius > this.maxRadius) {
      return this.countryWideMarkers(radius);
    }

    // We could do some sort of lookup to improve this.
    const assumed_zip_code_radius = 0.5;
    let markers = [];
    const randUnit = (radius + assumed_zip_code_radius) / 55;
    let markerCount = this.getMaxCountFromRadius(radius) / 10;

    if (markerCount > 2000) {
      markerCount = 2000;
    }

    while (markers.length < markerCount) {
      const lat = this.getRandomInRange(this.mapCenter.lat() - randUnit, this.mapCenter.lat() + randUnit, 6);
      const lng = this.getRandomInRange(this.mapCenter.lng() - randUnit, this.mapCenter.lng() + randUnit, 6);
      const dist = this.haversineDistance([this.mapCenter.lng(), this.mapCenter.lat()], [lng, lat], true);

      if (dist <= radius + assumed_zip_code_radius) {
        markers.push(new google.maps.Marker({
          position: new google.maps.LatLng(lat, lng),
          map: null,
          icon: this.getIcon()
        }));
      }
    }
    return markers;
  }

  countryWideMarkers(radius) {
    let markerCount = this.getMaxCountFromRadius(radius) / 10;
    if (markerCount > 10000) {
      markerCount = 10000;
    }
    let markers = [];

    const usCities = new UsCities;
    const cities = usCities.cities();
    const randUnit = 1;

    while (markers.length < markerCount) {
      for (let i = 0; i < cities.length; i++) {
        const cityLat = cities[i]['Coordinates'].split(',')[0];
        const cityLng = cities[i]['Coordinates'].split(',')[1];

        const lat = this.getRandomInRange(cityLat - randUnit, cityLat + randUnit, 6)
        const lng = this.getRandomInRange(cityLng - randUnit, cityLng + randUnit, 6)

        markers.push(new google.maps.Marker({
          position: new google.maps.LatLng(lat, lng),
          map: null,
          icon: this.getIcon()
        }));
      }
    }

    return markers;
  }

  haversineDistance(coords1, coords2, isMiles) {
    function toRad(x) {
      return x * Math.PI / 180;
    }

    const lon1 = coords1[0];
    const lat1 = coords1[1];

    const lon2 = coords2[0];
    const lat2 = coords2[1];

    const R = 6371; // km

    const x1 = lat2 - lat1;
    const dLat = toRad(x1);
    const x2 = lon2 - lon1;
    const dLon = toRad(x2)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;

    if(isMiles) d /= 1.60934;

    return d;
  }

  getRandomInRange(from, to, fixed) {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
  }
}
