class Popover {

  constructor(el){
    this.el = el;
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

    return '<div id="popover-header"> \
      <h4 id="title">' + precinct + '</h4> \
      <span id="close">&#10006;</span> \
    </div> \
    <table> \
      <thead> \
        <tr> \
          <th>Candidate</th> \
          <th class="right">Votes</th> \
          <th class="right">Pct.</th> \
        </tr> \
      </thead> \
      <tbody>' + popup_html + '</tbody> \
    </table>';
  }

  is_in_viewport() {
    let el = document.querySelector(this.el);

    var top = el.offsetTop;
    var left = el.offsetLeft;
    var width = el.offsetWidth;
    var height = el.offsetHeight;

    while(el.offsetParent) {
      el = el.offsetParent;
      top += el.offsetTop;
      left += el.offsetLeft;
    }

    return (
      top < (window.pageYOffset + window.innerHeight) &&
      left < (window.pageXOffset + window.innerWidth) &&
      (top + height) > window.pageYOffset &&
      (left + width) > window.pageXOffset
    );
  }

  open(f) {
    var self = this;

    // Create and populate popover if mobile or small viewport
    let precinct = f.properties.precinct;
    let votes_obj = eval(f.properties.votes_obj);
    // let votes_obj = JSON.parse(f.properties.votes_obj);
    // List appears to be pre-sorted but best make sure
    votes_obj.sort((a, b) => b.votes - a.votes);

    let el = document.querySelector(this.el);
    el.innerHTML = this._layout(precinct, votes_obj);

    let close_button = el.querySelector('#close');
    close_button.onclick = function() {
      self.close();
    }

    if (el.style.visibility != 'visible') {
      el.style.visibility = 'visible';
    }
  }

  close() {
    let el = document.querySelector('#map-popover');
    if (el.style.visibility == 'visible') {
      el.style.visibility = 'hidden';
    }
  }

}

export default Popover;
