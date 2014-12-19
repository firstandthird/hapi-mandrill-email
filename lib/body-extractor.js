module.exports = function(html) {

  var match = html.match(/<body.*?>(.*)<\/body/);

  if (match) {
    return match[1];
  } else {
    return html;
  }

};
