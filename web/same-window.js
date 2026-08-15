(function(){
  function sameOrigin(url){
    try { return new URL(url, location.href).origin === location.origin; }
    catch(e){ return false; }
  }
  document.addEventListener("click", function(e){
    var a = e.target && e.target.closest ? e.target.closest("a[target=_blank]") : null;
    if (a && sameOrigin(a.href)) {
      e.preventDefault();
      location.href = a.href;
    }
  }, true);
  var _open = window.open;
  window.open = function(url, name){
    if (sameOrigin(url)) { location.href = url; return null; }
    return _open.apply(window, arguments);
  };
})();
