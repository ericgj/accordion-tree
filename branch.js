module.exports = function anonymous(obj) {

  function escape(html) {
    return String(html)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  function section(obj, prop, negate, str) {
    var val = obj[prop];
    if ('function' == typeof val) return val.call(obj, str);
    if (negate) val = !val;
    if (val) return str;
    return '';
  };

  return "<li data-path='" + escape(obj.path) + "' class='branch'>\n  <h3><span class='caret'></span><span aria-hidden='true' class='icon'></span>" + obj.content + "</h3>\n  <ul class='children'></ul>\n</li>\n\n"
}
