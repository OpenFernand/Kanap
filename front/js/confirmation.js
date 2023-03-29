/***********************************/
/* Affichage du numéro de commande */
/***********************************/

//-- Récuperation du N° Commande (orderId) passé dans l'URL
/*********************************************************/
let orderId = new URLSearchParams(window.location.search).get('orderId');

//-- Positionne le N° de commande dans la zone HTML prévu pour l'affichage
/*************************************************************************/
document.getElementById('orderId').textContent = orderId;

//-- Vide le contenu de localStorage
/***********************************/
window.localStorage.clear();