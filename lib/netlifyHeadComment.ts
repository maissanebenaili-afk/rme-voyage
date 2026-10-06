/**
 * En production (pas sur les aperçus), Netlify insère dans <head>, juste après
 * <meta charset>, un commentaire HTML « This site is hosted on Netlify… ».
 * React 19 trouve alors un nœud qu'il n'a pas rendu et lève l'erreur #418 sur
 * toutes les pages (mesuré le 6 octobre 2026 : retirer ce commentaire supprime
 * l'erreur sur la production, l'ajouter à un aperçu la fait apparaître).
 *
 * Ce script, placé dans <head> et exécuté pendant la lecture de la page, donc
 * avant l'hydratation, retire uniquement ce commentaire-là et les espaces
 * insérés avec lui (un simple saut de ligne restant suffit à provoquer #418).
 */
export const NETLIFY_HEAD_COMMENT_CLEANUP =
  '(function(){var h=document.head;if(!h)return;var ws=function(n){return n&&n.nodeType===3&&!/\\S/.test(n.nodeValue||"")};' +
  'for(var n=h.firstChild;n;){var x=n.nextSibling;' +
  'if(n.nodeType===8&&/hosted on Netlify/.test(n.nodeValue||"")){' +
  // Le saut de ligne inséré avec le commentaire est aussi un nœud que React n'a pas rendu.
  'var p=n.previousSibling;if(ws(p))h.removeChild(p);if(ws(x)){var y=x.nextSibling;h.removeChild(x);x=y;}h.removeChild(n);}' +
  'n=x;}})();';
