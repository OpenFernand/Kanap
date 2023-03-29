
/*********************************************************************************************/
/* Générer la page produit : Récupération de la chaine de la requete (après le ?) dans l'URL */
/* puis extraire l'id présent (en supprimant ?id=) dans URL page courante et ne selectionner */
/* les détails d'un produit qui seront insérés dans les éléments du DOM (créer ou m.à.j)	 */
/*********************************************************************************************/

//-- Récupère la chaine de la requete dans l'URL
const queryString_url_id = window.location.search; 
const urlSearchParams = new URLSearchParams(queryString_url_id);
const id = urlSearchParams.get("id");
console.log(id);

//-- Executer la Fonction qui récupère les données détails d'1 seul produit 
searchProduct();

//-- Recupération des du détail d'un seul produit avec l'id reçu en parametre et Charger la fonction d'insertion dans le DOM --
async function searchProduct() {
	await fetch('http://localhost:3000/api/products/' + id) 
		.then((res) => res.json()) 
		.then((product) => insertProductInDom(product))
		.catch((error) => {
			console.log(error);
			window.alert('Connexion au serveur impossible !');
		});
}

//-- Fonction qui insère les détails du produit dans les éléments du DOM (créer ou modifier) --
function insertProductInDom(product) {  

	// -- création de l'image
    let itemImg = document.querySelector('.item__img');
    let newImg = document.createElement('img'); //-- créer la balise image, car inexistant dans le HTML --
    newImg.setAttribute('src', product["imageUrl"]);//-- Ajouter l'attribut src à l'image, pour indiquer l'URL de l'image --
    newImg.setAttribute('alt', product["altText"]); //-- Ajouter un attribut alt, contenant la description des images --
    itemImg.appendChild(newImg) //-- Rattacher img à la div parent --
	console.log(product)
	console.log(newImg)

	// -- modification du h1 "titre"
    let itemTitle = document.getElementById('title'); //-- Capture de l'Id "title " du h1 --
    itemTitle.textContent = product["name"]; //-- Prendre le nom "name" du produit dans product --

	// -- modification du prix
    let itemPrice = document.getElementById('price'); //-- Capture du "prix" du produit "price " --
    itemPrice.textContent = product["price"] //-- Prendre le prix des produits du produit "price " --

	// -- modification de la description
    let itemDescription = document.getElementById('description'); //-- Capture de la description de l'ID de l'élément p --
    itemDescription.textContent = product["description"]; //-- Prendre les éléments de la description du "produit" dont j'ai besoin --

    //-- Inserer les options de couleur & valeur couleur dans le DOM : balise <option> pour "menu déroulant"--
    let itemColor = document.getElementById('colors');
    for(let i = 0; i < product['colors'].length; i++){
      itemColor.innerHTML += '<option value="'+product['colors'][i]+'">'+product['colors'][i]+'</option>'; //-- le code couleur et texte couleur --
    }
};

//-- Ecoute de l'evenement click (bouton : Ajouter dans le panier) et déclenche la fonction addQuantityToCard --
document.querySelector('#addToCart').addEventListener('click', addQuantityToCart);

//-- Déclenche la fonction modifyQuantity lorsque la quantité est modifiée, et la met à jour --
document.querySelector('[name="itemQuantity"]').addEventListener('input', modifyQuantity);

//-- Déclenche la fonction controlQuantity qui force à 0 ou 100 en fonction des cas après relachement de la touche clavier (Keyup) --
document.querySelector('[name="itemQuantity"]').addEventListener('keyup', controlQuantity);

/*********************************************************************************************/
/* Générer la page produit : Ajoute les produits au panier (ne seront pas encore visible sur */
/* la page Panier)- Modifie la quantité - Controle les saisies des champs quantité et couleur*/
/* Enregistre dans le localStorage - Affiche les alertes après les tests.                    */  												                     
/*********************************************************************************************/

//-- Fonction qui ajoute un produit. Teste s'il existe déjà, si oui, alors ajout de la quantité au produit existant
function addQuantityToCart() {
	//-- Récupère la quantité et la couleur choisie
	const newQuantity = document.querySelector('#quantity').value;
	const currentColor = document.querySelector('#colors').value;

	//-- Test si les 2 conditions sur quantité et couleur sont réunies, consulter le localStorage et en récupérer données
	if (newQuantity > 0 && newQuantity <= 100 && currentColor != '') { 
		let arrayProduct = JSON.parse(localStorage.getItem('product'));

		// Récupère dans un objet les options (choix de la couleur, quantité) du produit à ajouter au panier
		let objJson = {
			id: id,
			quantity: parseInt(newQuantity),
			color: currentColor,
		};

		if (arrayProduct == null) {
			arrayProduct = []; //-- j'initialise --
			arrayProduct.push(objJson); //-- Si tableau est vide alors enregistrer les options choisies  (objJson) à ajouter au panier
		} else {
			const productSearch = arrayProduct.find((product) => product.id == objJson.id && product.color == objJson.color);

			if (productSearch != undefined) {
				const valeurPresente = productSearch.quantity;
				const addValue = parseInt(valeurPresente) + parseInt(newQuantity); //-- Additionner la nlle quantité à l'ancienne --
				if (addValue > 100) { //-- Si la nlle qté + l'ancienne qté > 100 alors je mets 100
					arrayProduct.quantity = 100;
					let max = 100 - valeurPresente; //-- Calculer la qté maximum à ajouter pour totaliser 100 et j'informe par message alerte --
					if (max > 0) {
						alert(`Vous avez déjà ${valeurPresente} produit(s) dans votre panier, 
                        la limite maximale autorisée de 100 sera dépassé ! 
                        ${max} produits vont être ajoutés au panier !`);
					} else {
						alert('Quantité maximale déjà atteinte !'); //-- j'informe que la limite est dépassée --
					}
				} else {
					arrayProduct.quantity = addValue; //-- Si la qté nlle saisie + l'ancienne qté < 100 alors j'enregistre la somme --
				}
				//-- pour chaque produit, tant que la qté <=100 j'additionne les nouvelles qté --
				arrayProduct.forEach((product) => { 
					if (product.id == objJson.id && product.color == objJson.color) {
						if (addValue <= 100) {
							product.quantity = parseInt(product.quantity) + parseInt(objJson.quantity);
						} else {
							product.quantity = 100;
						}
					}
				});
			} else {
				arrayProduct.push(objJson);
			}
		}
		//-- Enregistrer le contenu dans le localStorage et revienir sur la page d'accueil --
		localStorage.setItem('product', JSON.stringify(arrayProduct));
		window.location.href = 'index.html';

	//-- Si les 2 conditions sur quantité et couleur ne sont pas réunies, appeller la fonction qui teste champs non renseignés --
	} else {
		testContentFields(newQuantity, currentColor);
	}
}

//-- Fonction qui récupère la quantité MAJ, et la couleur puis verifie qu'ils sont correcte et l'enregistre dans le localStorage --
function modifyQuantity() {
	const currentColor = parseInt(document.querySelector('#colors').value);
	let arrayProduct = findIdColor(id, currentColor);
	let currentQuantity = parseInt(document.querySelector('#quantity').value);
	if (currentQuantity != null && arrayProduct != undefined) {
		arrayProduct.quantity = currentQuantity;
		localStorage.setItem('product', JSON.stringify(arrayProduct)); //-- Enregistre dans le locaStorage à la fin du tableau --
	}
}

//-- Fonction qui recherche un doublon ou les paramètres "id" et "color" du produit en cours
function findIdColor(id, color) {
	let item = {};
	for (let i = 0; i < localStorage.length; i++) {
		item = JSON.parse(localStorage.getItem('product', i));
		if (item.id == id && item.color == color) return item;
	}
	return undefined;
}

//-- Fonction qui contrôle la quantité saisie directement et force 0 ou 100 si quantité saisie est <= 0 et > 100 --
function controlQuantity() {
	const quantity = document.querySelector('#quantity').value;
	if (quantity != null) {
		if (quantity < 0) document.querySelector('#quantity').value = 0;
		if (quantity > 100) document.querySelector('#quantity').value = 100;
	}
}

//-- Fonction qui contrôle si les champs sont remplis, et affiche un message d'alerte --
function testContentFields(varQuantity, varColor) {
	if ((varQuantity <= 0 || varQuantity > 100) && varColor == '') {
		alert(`Veuillez électionner une couleur et saisir une quantité comprise entre 1 et 100 !`);	

	} else {
		if ((varQuantity <= 0 || varQuantity > 100) &&  varColor !== '') {
			alert(`Veuillez saisir une quantité comprise entre 1 et 100 !`);
		}else{
			if (varColor == '') {
				alert(`Veuillez électionner une couleur !`);
			}
		}
	}
}
