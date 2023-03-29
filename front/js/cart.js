
/*********************************************************************************************/
/* Générer la page Panier :  Afficher un tableau récapitulatif de tous achats dans le panier,*/
/* avec la possibilité de modifier la quantité ou supprimer un produit. Analyser et contrôler*/
/* les saisies dans le formulaire de contact (format et type de données) avant de tout       */
/* renvoyer au back-end. 																 */
/*********************************************************************************************/
//-- Déclaration variable globale
let cart = [];
console.log(cart)

//-- Exécute la fonction qui charge tout le localStorage dans le panier
chargeCart();

//-- sélectionne le bouton "Commander" et le met en écoute d'un click
const orderButton = document.querySelector('#order');
orderButton.addEventListener('click', (order) => submitForm(order));

//-- met en écoute les 3 champs du formulaire et s'assure qu'il n y aura pas e chiffre dans les champs 
const parent = document.getElementById('firstName');
parent.addEventListener('keyup', () => testValidityForm(parent));
const parent2 = document.getElementById('lastName');
parent2.addEventListener('keyup', () => testValidityForm(parent2));
const parent3 = document.getElementById('city');
parent3.addEventListener('keyup', () => testValidityForm(parent3));


//-- Fonction qui récupère le contenu du localStorage (id, quantité, color), et appelle fonction d'affichage des produits dans le panier
/***************************************************************************************************************************************/
function chargeCart() {
	const recoverLs = localStorage.getItem('product');
	const jsonLs = JSON.parse(recoverLs);
	if (jsonLs != null) {
		const quantityLs = jsonLs.length;
		for (let i = 0; i < quantityLs; i++) { 
			searchProduct(jsonLs[i].id, jsonLs[i].color, jsonLs[i].quantity); //-- Execute la fonction qui récupère et affiche chaque produit-- 
		}
	}
	console.log(jsonLs)
	initLoad(); //-- Appel de la fonction qui test si les éléments du formulaire sont vides--
}

//-- Fonction qui récupère et renvois les données d'1 produit et appelle la fonction d'affichage d'un propduit
/***********************************************************************************************************/
async function searchProduct(id, color, quantity) {
	await fetch('http://localhost:3000/api/products/' + id)
		.then((res) => res.json())
		.then((data) => {
			let objet = data;
			Reflect.deleteProperty(objet, 'colors'); //-- Supprimer la propriété "colors"
			Reflect.deleteProperty(objet, '_id'); //-- Supprimer la propriété "_id"
			const objColor = {
				color: color,
				quantity: quantity,
				id: id,
			};
			const newObject = { 
				...data,
				...objColor,
			};
			cart.push(newObject);  //-- Ajout les données produit dans le panier pour i = 0; i < quantityLs --
			displayItem(newObject); //-- Appel la fonction qui lance l'affichage d'un produit sur page panier --
		})
		.catch((error) => {
			window.alert('Connexion au serveur impossible !');
			console.log(error);
		});
}

//-- Fonction qui lance l'affichage d'un produit sur la page Panier via plusieurs fonctions
/******************************************************************************************/
function displayItem(item) {
	const product = createProduct(item); //-- appel fonction de création Item
	const imageDiv = createImageDiv(item); //-- appel fonction de cration image
	product.appendChild(imageDiv); //--appendChild pour ajouter le noeud DOM

	const cardItem = createStructDescription(item); //-- appel fonction de création structDescription
	product.appendChild(cardItem); //--appendChild pour ajouter le noeud DOM

	document.querySelector('#cart__items').appendChild(product); //--appendChild pour ajouter le noeud DOM
	afficheTotalPrice(); //-- appel fonction d'affichage prix
	afficheTotalQuantity(); //-- appel fonction d'affichage quantité

	initLoad(); //-- Appel la fonction qui test si les éléments du formulaire sont vides */

}

//-- Fonction qui créer l'élément produit (création de la balise article)
/***********************************************************************/
function createProduct(item) {
	const product = document.createElement('article');
	product.classList.add('cart__item'); // Ajoute la classe cart__item
	product.dataset.id = item.id; // fournit l'acces en lecture et ecriture à l'attribut id
	product.dataset.color = item.color; // fournit l'acces en lecture et ecriture à 'attribu color
	return product;
}

//-- Fonction qui créer la DIV image
/***********************************/
function createImageDiv(item) {
	const div = document.createElement('div');
	div.classList.add('cart__item__img');

	const image = document.createElement('img');
	image.src = item.imageUrl;
	image.alt = item.altTxt;

	div.appendChild(image);
	return div;
}

//-- Fonction qui construit la partie description du produit
/************************************************************/
function createStructDescription(item) {
	const cardItem = document.createElement('div');
	cardItem.classList.add('cart__item__content');

	const description = createDescription(item);
	const settings = createDivSettings(item);

	console.log('settings', settings)

	cardItem.appendChild(description);
	cardItem.appendChild(settings);
	return cardItem;
}

//-- Fonction qui créer la DIV contenant la description du produit et le prix
/****************************************************************************/
function createDescription(item) {
	const description = document.createElement('div');
	description.classList.add('cart__item__content__description');

	const h2 = document.createElement('h2');
	h2.textContent = item.name;

	const p = document.createElement('p');
	p.textContent = item.color;

	const p2 = document.createElement('p');
	p2.textContent = item.price + ' €';

	description.appendChild(h2);
	description.appendChild(p);
	description.appendChild(p2);
	return description;
}

//-- Fonction qui met en écoute le lien de suppression et les modifications de quantités
/************************************************************************************/
function createDivSettings(item) {
	const elementDiv = document.createElement('div');
	elementDiv.classList.add('cart__item__content__settings');
	addDivQuantity(elementDiv, item);
	addDivDelete(elementDiv, item);
	return elementDiv;
}

//-- Fonction qui récupère les quantités et les additionnes pour l'affichage du total
/***********************************************************************************/
function afficheTotalQuantity() {
	const parent = document.querySelector('#totalQuantity');
	let total = 0;
	const LS = JSON.parse(localStorage.getItem('product'));
		for (let i = 0; i < LS.length; i++) {
			total += parseInt(LS[i].quantity);
		}
		parent.textContent = parseInt(total);
}

//-- Fonction qui récupère les quantités et prix puis affiche le montant € total
/*****************************************************************************/
function afficheTotalPrice() {
	const parent = document.querySelector('#totalPrice');
	let total = 0;
	const LS = JSON.parse(localStorage.getItem('product'));
	if(LS.length > 0){
		for (let i = 0; i < LS.length; i++) {
			fetch('http://localhost:3000/api/products/' + LS[i].id)
				.then((res) => res.json())
				.then((data) => {
					total += parseInt(data.price) * parseInt(LS[i].quantity);
					parent.textContent = parseInt(total);
				})
				.catch((error) => {
					window.alert('Connexion au serveur impossible !');
					console.log(error);
				});
		}
	}else{
		parent.textContent = parseInt(total);
	}
}

//-- Fonction qui créer le block de suppression et met le lien "supprimer" en écoute
/*********************************************************************************/
function addDivDelete(settings, item) {
	const div = document.createElement('div');
	div.classList.add('cart__item__content__settings__delete');
	div.addEventListener('click', () => deleteItem(item));

	const p = document.createElement('p');
	p.classList.add('deleteItem');
	p.textContent = 'Supprimer_moi';
	div.appendChild(p);

	settings.appendChild(div);
}

//-- Fonction qui cherche dans le panier le produit à supprimer du panier et mettre à jour l'affichage
/****************************************************************************************************/
function deleteItem(item) {

	console.log('item', item)

	let itemForDelete = cart.findIndex((product) => product.id === item.id && product.color === item.color);
	if (itemForDelete > -1) {		
		cart.splice(itemForDelete, 1);
		let tempArray = [];
		for (let i = 0; i < cart.length; i++) {
			const tempObject = {
				id: cart[i].id,
				color: cart[i].color,
				quantity: cart[i].quantity,
			};
			tempArray.push(tempObject);
		} 
		localStorage.clear();
		localStorage.setItem('product', JSON.stringify(tempArray)); //-- dans localStorage, on fait la mise à jour via la clé --
	
		const parent = document.querySelector(`article[data-id="${item.id}"][data-color="${item.color}"]`); 
		
		console.log('parent', parent)

		parent.remove(); //-- supprime le produit du DOM (de l'écran) --
		afficheTotalPrice(); //-- appelle la fonction de recalcul du total prix --
		afficheTotalQuantity(); //-- appelle la fonction de recalcul du total quantitié --

		setTimeout(function(){ //-- pour tenir compte du décalage d'affichage du totalprix et quantité vs Alerte produit supprimé --
			alert("Le produit a été supprimé du panier");
		},10);
	}
}

// fonction qui créer la DIV comprenant le INPUT et met en écoute pour la modification de quantité
/*************************************************************************************************/
function addDivQuantity(settings, item) {
	const quantity = document.createElement('div');
	quantity.classList.add('cart__item__content__settings__quantity');

	const p = document.createElement('p');
	p.textContent = 'Qté : ';
	quantity.appendChild(p);

	const input = document.createElement('input');
	input.type = 'number';
	input.classList.add('itemQuantity');
	input.name = 'itemQuantity';
	input.min = '1';
	input.max = '100';
	input.value = parseInt(item.quantity);

	input.addEventListener('keyup', () => controlQuantity(item, input));
	input.addEventListener('input', () => listenQuantity(item, input));

	quantity.appendChild(input);
	settings.appendChild(quantity);
}

//-- Fonction qui contrôle la quantité tapé directement
/****************************************************/
function controlQuantity(item, input) {
	inputValue = input.value;

	let newValue = parseInt(item.quantity);
	if (newValue < 1 || newValue === 'null' || isNaN(newValue) || newValue === '') newValue = 1;
	if (newValue > 100) newValue = 100;
	input.value = newValue;
	let itemLs = JSON.parse(localStorage.getItem('product'));
	for (let i = 0; i < itemLs.length; i++) {
		if (itemLs[i].id == item.id && itemLs[i].color == item.color) {
			if (newValue > 0 && newValue <= 100) {
				itemLs[i].quantity = newValue;
				localStorage.setItem('product', JSON.stringify(itemLs));
			} else {
				itemLs[i].quantity = 1;
				localStorage.setItem('product', JSON.stringify(itemLs));
			}
		}
	}
	afficheTotalPrice();
	afficheTotalQuantity();
}

//-- Fonction qui met à jour la modification de quantité d'un produit dans le localStorage
/***************************************************************************************/
function listenQuantity(item, input) {
	let newValue = parseInt(input.value);
	if (newValue > 100) input.value = 100;
	item.quantity = parseInt(newValue);
	let itemLs = JSON.parse(localStorage.getItem('product'));
	for (let i = 0; i < itemLs.length; i++) {
		if (itemLs[i].id == item.id && itemLs[i].color == item.color) {
			if (newValue > 0 && newValue <= 100) {
				itemLs[i].quantity = newValue;
				localStorage.setItem('product', JSON.stringify(itemLs));
			} else {
				itemLs[i].quantity = 1;
				localStorage.setItem('product', JSON.stringify(itemLs));
			}
		}
	}

	afficheTotalPrice();
	afficheTotalQuantity();
}

//-- Fonction pour le Formulaire qui met en écoute le texte tapé dans le input #email, appelle la fonction qui 
//   test si les éléments du formulaire sont vides; met un peu de padding-left pour l'esthétique.
/**************************************************************************************************************/
function initLoad() {
	// document.getElementById('mess-oblig').style.textAlign = 'right';

	const email = document.querySelector('#email');
	email.addEventListener('keyup', (element) => controlEmail()); //-- Exécute la fonction de contrôle d'email --

	const form = document.querySelector('.cart__order__form');
	const inputs = form.querySelectorAll('input');
	inputs.forEach((element) => {
		if (element.value != '') {
			if (element.id === 'order') element.setAttribute('style', 'padding-left: 28px;');
			if (element.id != 'order') element.setAttribute('style', 'padding-left: 15px;');
		} else {
			if (element.id != 'order') element.setAttribute('style', 'padding-left: 15px;');
		}
	});
}

//-- Fonction pour le formulaire qui pour les 3 champs, firsName, lastName, City
//   remplace la saisie de chiffres par des par ''. Evite la présence de chiffre dans le champs
/**********************************************************************************************/
function testValidityForm(parent) {
	let textTemp = parent.value;
	let newStr = textTemp.replace(/0/g, '');
	newStr = newStr.replace(/1/g, '');
	newStr = newStr.replace(/2/g, '');
	newStr = newStr.replace(/3/g, '');
	newStr = newStr.replace(/4/g, '');
	newStr = newStr.replace(/5/g, '');
	newStr = newStr.replace(/6/g, '');
	newStr = newStr.replace(/7/g, '');
	newStr = newStr.replace(/8/g, '');
	newStr = newStr.replace(/9/g, '');
	newStr = newStr.replace(/'/g, '');
	newStr = newStr.replace(/"/g, '');
	newStr = newStr.replace(/=/g, '');
	parent.value = newStr;
}

//-- Fonction pour le Formulaire, qui contrôle que le champs #email est correctement saisi, 
//   renvoie "true" si c'est correct, avant de valider la commande et soumettre le formulaire
/********************************************************************************************/
function controlEmail() {
	const pattern = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/i);
	const elem = document.querySelector('#email');
	const valueTextEmail = elem.value;
	const resultRegex = valueTextEmail.match(pattern);
	const errorMsg = document.querySelector('#emailErrorMsg');

	console.log('elem', elem)
	console.log('valueTextEmail', valueTextEmail)
	console.log('resultRegex', resultRegex)
	console.log('errorMsg', errorMsg)

	if (resultRegex == null) {
		elem.setAttribute('style', 'color: #FF0000; padding-left: 15px;');
		errorMsg.textContent = 'Veuillez entrer une adresse email valide !';
		return false;
	} else {
		elem.setAttribute('style', 'color: #000; padding-left: 15px;');
		errorMsg.textContent = '';
		return true;
	}
}

//-- Fonction pour le Formulaire qui créer l'objet renvoyant les données du formulaire (contact)
/***********************************************************************************************/
function createObjetForContactForm() {
	const form = document.querySelector('.cart__order__form');
	const contactForm = {
		contact: {
			firstName: form.firstName.value,
			lastName: form.lastName.value,
			address: form.address.value,
			city: form.city.value,
			email: form.email.value,
		},
		products: listIDs(), // fournit la liste des IDs à transmettre
	};
	return contactForm;
}

//-- Fonction qui appelle la fonction de test des champs contacts et controleEmail. Si retourne = true, alors 
//   appelle la fonction qui passe la Commande en transmettant les données à la page de confirmation.html
/****************************************************************************************************/
function submitForm(order) {
	order.preventDefault(); // empêche de rafraichir la page
	if (cart.length === 0) {
		alert(`Votre panier est vide, il ne contient aucun produit !`); // affiche le message indiquant que le panier est vide
		return;
	}
	const pass = testFieldsIsEmpty(); // Appele la fonction de test des champs en retournant "true" ou "false"
	if (pass) {
		const contactForm = createObjetForContactForm(); // construit l'objet avec les données de contacts et la liste des IDs des produits
		if (controlEmail()) sendCommand(contactForm); // appelle la fonction qui transmet les données à la page confirmation
	}
}

//-- Fonction qui transmet la commande à la page Confirmation.HTML avec le N° Commande 
//   (order.id) avec la configration de la requete POST
/*************************************************************************************/
async function sendCommand(contactForm) {
	await fetch('http://localhost:3000/api/products/order', {
		method: 'POST',
		body: JSON.stringify(contactForm),
		headers: { 'Content-Type': 'application/json' },
	})
		.then((res) => res.json())
		.then((data) => {
			const orderId = data.orderId;
			window.location.href = 'confirmation.html?orderId=' + orderId;
		})
		.catch((err) => {
			console.error(err);
			alert('erreur: ' + err);
		});
}

// fonction qui renvoie un tableau de tous les IDs des produits du panier
/************************************************************************/
function listIDs() {
	let ids = [];
	for (let i = 0; i < cart.length; i++) {
		ids.push(cart[i].id);
	}
	return ids;
} 

//-- Fonction qui test si le contenu d'un champs est vide, et met la bordure en rouge ou en gris
/***********************************************************************************************/
function testInData(element) {
	if (element.id != 'order') {
		if (element.value === '') {
			element.setAttribute('style', 'border:1px solid #FF0000; padding-left: 15px;');
		} else {
			element.setAttribute('style', 'border:1px solid #767676; padding-left: 15px;');
			switch (element.id) {
				case 'firstName': {
					document.querySelector('#firstNameErrorMsg').textContent = '';
					break;
				}
				case 'lastName': {
					document.querySelector('#lastNameErrorMsg').textContent = '';
					break;
				}
				case 'address': {
					document.querySelector('#addressErrorMsg').textContent = '';
					break;
				}
				case 'city': {
					document.querySelector('#cityErrorMsg').textContent = '';
					break;
				}
			}
		}
	}
}

//-- Fonction pour le Formulaire qui test si les champs contact sont vides 
//   en appelant la fonction testInData et affiche le message d'erreur et retourne "false"
/***************************************************************************************/
function testFieldsIsEmpty() {
	const form = document.querySelector('.cart__order__form');
	const inputs = form.querySelectorAll('input');
	let pass = true;
	inputs.forEach((element) => {
		element.addEventListener('input', () => testInData(element));

		switch (element.id) {
			case 'firstName': {
				if (element.value == '') {
					element.setAttribute('style', 'border:1px solid #FF0000; padding-left: 15px;');
					document.querySelector('#firstNameErrorMsg').textContent = 'Veuillez entrer votre prénom';
					pass = false;
				}
			}
			case 'lastName': {
				if (element.value == '') {
					element.setAttribute('style', 'border:1px solid #FF0000; padding-left: 15px;');
					document.querySelector('#lastNameErrorMsg').textContent = 'Veuillez entrer votre nom';
					pass = false;
				}
			}
			case 'address': {
				if (element.value == '') {
					element.setAttribute('style', 'border:1px solid #FF0000; padding-left: 15px;');
					document.querySelector('#addressErrorMsg').textContent = 'Veuillez entrer votre adresse';
					pass = false;
				}
			}
			case 'city': {
				if (element.value == '') {
					element.setAttribute('style', 'border:1px solid #FF0000; padding-left: 15px;');
					document.querySelector('#cityErrorMsg').textContent = 'Veuillez entrer une ville';
					pass = false;
				}
			}
			case 'email': {
				if (element.value == '') {
					element.setAttribute('style', 'border:1px solid #FF0000; padding-left: 15px;');
					document.querySelector('#emailErrorMsg').textContent = 'Veuillez entrer une adresse email valide !';
					pass = false;
				}
			}
		}
	});
	return pass;
}