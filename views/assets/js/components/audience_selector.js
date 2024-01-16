class AudienceSelector {
  constructor(element) {
    console.debug('\tSiteImpact AudienceSelector');
    this.element = element;
    this.audienceOptions = JSON.parse(element.dataset.audienceOptions);
    this.zipCode = element.dataset.zipCode;
    this.cpm = element.dataset.cpm
    this.maxRadius = element.dataset.maxRadius;
    this.slider = element.querySelector('#v-audience_selector_slider').vComponent;
    this.initMap();
  }

  // constructor(opts) {
  //   var self = this;
  //   this.audienceOptions = opts.audience_options;
  //   this.town = opts.venue.town;
  //   this.zip = opts.venue.post_code;
  //   this.personImageUrl = opts.personImageUrl;
  //   this.slider = document.getElementById("range");
  //   this.output = document.getElementById("range-value");
  //   this.audienceCount = document.getElementById("audience-count");
  //   this.slider.oninput = function() {
  //     self.updateSlider();
  //   };
  //   this.pcm = opts.pcm;
  //   this.updateSlider();
  //   this.markers = {};
  //   this.maxRadius = opts.max_radius;
  // }

  async initMap() {
    // let geocoder = new google.maps.Geocoder();
    const {Geocoder} = await google.maps.importLibrary("geocoding");
    const {Map} = await google.maps.importLibrary("maps");

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
        //this.createMarkers();
        //this.updateSlider();
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
    let campaign_count_id = this.audienceOptions[value].email_campaign_count_id;

    if (radius > this.maxRadius) {
      this.output.innerHTML = "'Opt-in' subscribers in the USA <span>&nbsp;</span>"
      $('#loc-perk').html(loc.replace("located ", "Subscribers in the USA"));
    }
    else {
      if (radius > 0) {
        var loc = "located within " + radius + " miles of zip code " + this.zip;
      }
      else {
        var loc = "located in zip code " + this.zip;
      }

      this.output.innerHTML = "'Opt-in' subscribers in or near " + this.town + "<span>(" + loc + ")</span>"
      $('#loc-perk').html(loc.replace("located ", ""));
    }

    $('#audience-size-perk').html(this.numberWithCommas(count) + ' Subscribers')

    this.audienceCount.innerHTML = this.numberWithCommas(count);

    $('.info-box h2').html(this.numberWithCommas(((count * this.pcm) / 1000)));

    document.getElementById("email_campaign_selected_email_campaign_count_id").value = campaign_count_id;
    document.getElementById("email_campaign_selected_audience_size").value = count;

    if (this.map) {
      if (this.map.getZoom() != this.zoom()) {
        // Clear all markers and start again.
        for (var radiusEach in this.markers) {
          for (var i = 0; i < this.markers[radiusEach].length; i++) {
            if (this.markers[radiusEach] && this.markers[radiusEach][i]) {
              this.markers[radiusEach][i].setMap(null);
            }
          }
        }
      }

      this.map.setZoom(this.zoom());
      this.map.setCenter(this.mapCenterCoordinates());

      if (this.radius() > this.maxRadius) {
        var markerCount = count / 50;
      }
      else {
        var markerCount = count / 10;
      }

      // Now show only the right number of markers
      for (var i = 0; i < this.markers[radius].length; i ++) {
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
    if (Math.random() < 0.5) {
      return 'http://maps.google.com/mapfiles/ms/micons/man.png'
    }
    else {
      return 'http://maps.google.com/mapfiles/ms/micons/woman.png'
    }
  }

  createMarkers() {
    var radii = [];

    for (var i = 0; i < this.audienceOptions.length; i ++) {
      if (radii.indexOf(this.audienceOptions[i].radius) == -1) {
        radii.push(this.audienceOptions[i].radius);
      }
    }

    for (var i = 0; i < radii.length; i++) {
      this.markers[radii[i]] = this.createMarkersForRadius(radii[i]);
    }
  }

  getMaxCountFromRadius(radius) {
    var maxFound = 0;
    for (var i = 0; i < this.audienceOptions.length; i ++) {
      if (this.audienceOptions[i].radius == radius && this.audienceOptions[i].count > maxFound) {
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
    var assumed_zip_code_radius = 0.5;

    var markers = [];

    var randUnit = (radius + assumed_zip_code_radius) / 55;
    var markerCount = this.getMaxCountFromRadius(radius) / 10;

    if (markerCount > 2000) {
      markerCount = 2000;
    }

    var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'

    while (markers.length < markerCount) {
      var lat = this.getRandomInRange(this.mapCenter.lat() - randUnit, this.mapCenter.lat() + randUnit, 6)
      var lng = this.getRandomInRange(this.mapCenter.lng() - randUnit, this.mapCenter.lng() + randUnit, 6)

      var dist = this.haversineDistance([this.mapCenter.lng(), this.mapCenter.lat()], [lng, lat], true)

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
    var markerCount = this.getMaxCountFromRadius(radius) / 10;
    if (markerCount > 10000) {
      markerCount = 10000;
    }
    var markers = [];

    var usCities = new UsCities;
    var cities = usCities.cities();
    var randUnit = 1;

    while (markers.length < markerCount) {
      for (var i = 0; i < cities.length; i++) {
        var cityLat = cities[i]['Coordinates'].split(',')[0];
        var cityLng = cities[i]['Coordinates'].split(',')[1];

        var lat = this.getRandomInRange(cityLat - randUnit, cityLat + randUnit, 6)
        var lng = this.getRandomInRange(cityLng - randUnit, cityLng + randUnit, 6)

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

    var lon1 = coords1[0];
    var lat1 = coords1[1];

    var lon2 = coords2[0];
    var lat2 = coords2[1];

    var R = 6371; // km

    var x1 = lat2 - lat1;
    var dLat = toRad(x1);
    var x2 = lon2 - lon1;
    var dLon = toRad(x2)
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;

    if(isMiles) d /= 1.60934;

    return d;
  }

  getRandomInRange(from, to, fixed) {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
  }
}
