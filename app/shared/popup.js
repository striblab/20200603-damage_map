class StribPopup {

  constructor(map){
    this.popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 30
    });
    this.map = map;
  }

  _get_name(name) {
    let name_array = name.split(' ')
    return name_array[name_array.length - 1]
  }

  _get_label(name) {
    let name_array = name.split(' ')
    return 'label-' + name_array[name_array.length - 1].toLowerCase();
  }

  _format_votes(input) {
    // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
    return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  _format_pct(input) {
    return Math.round(input * 10) / 10 + '%';
  }

  _layout(precinct, votes_obj) {

    let popup_html = ''

    for (let i = 0; i < votes_obj.length; i++) {
      let candidate = votes_obj[i];
      if (i < 6 && candidate.votes > 0) {
        popup_html += '<tr> \
          <td><span class="' + this._get_label(candidate.name) + '"></span>' + this._get_name(candidate.name) + '</td> \
          <td class="votes-right">' + this._format_votes(candidate.votes) + '</td> \
          <td class="votes-right">' + this._format_pct(candidate.votes_pct) + '</td> \
        </tr>'
      }
    }

    return '<div class=".mapboxgl-popup"> \
      <h4 id="title">' + precinct + '</h4> \
      <table> \
        <thead> \
          <tr> \
            <th>Candidate</th> \
            <th class="right">Votes</th> \
            <th class="right">Pct.</th> \
          </tr> \
        </thead> \
        <tbody>' + popup_html + '</tbody> \
      </table> \
    </div>';
  }

  open(e) {
    var coordinates = e.features[0].geometry.coordinates.slice();

    // Popup components
    let precinct = e.features[0].properties.precinct;
    let votes_obj = eval(e.features[0].properties.votes_obj);

    // List appears to be pre-sorted but best make sure
    votes_obj.sort((a, b) => b.votes - a.votes);

    // Populate the popup and set its coordinates
    // based on the feature found.
    this.popup.setLngLat(e.lngLat)
      .setHTML(this._layout(precinct, votes_obj))
      .addTo(this.map);
  }

  close() {
    this.popup.remove();
  }

}

export default StribPopup;
