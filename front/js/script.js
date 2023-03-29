
/*********************************************************************************************/
/* Générer la page Accueil : Intégrer l'ensemble des produits de l'API dans la page du site. */
/* On va requeter l'API pour récuperer les données des produits puis les afficher  en        */
/* éléments du DOM                                                                           */
/*********************************************************************************************/

//-- Requeter l'API pour obtenir l'ensemble des produits pour récupérer le détail des produits en json--
async function getProducts(){
    return await fetch("http://localhost:3000/api/products")
    .then(function(res) { 
        if (res.ok) { 
        return res.json(); //--Retourner les objets depuis server & Converti en Json-- 
      }
    })
    .then(function(value) { //--puis Retourner résultat-- 
        console.log(value);
        return value;
    })
    .catch(function(err) { //--On traite le cas d'erreur --
      alert (err)
    });
}

//-- Afficher les produits sur la page d'accueil  --
async function displayProducts() {
    const parser = new DOMParser(); //-- DOMParser analyse le code HTML de la chaine de caractere du DOM --
    const products = await getProducts();
    console.log("displayProducts", products);
    let productsSection = document.getElementById("items"); //-- Renvoie l'ensemble des objets produits du DOM --      
      for (let i = 0; i < products.length; i++) {  //-- Boucle d'itération pour inserer chaque produit sur la page accueil--
        var productsItems = //--HTML inséré dans le DOM par création des balises --
          `<a href="./product.html?id=${products[i]._id}"> 
            <article>
                <img src="${products[i].imageUrl}" alt="${products[i].altTxt}">
                <h3 class="productName">${products[i].name}</h3>
                <p class="productDescription">${products[i].description}</p>
            </article>
          </a>`;
        const displayShop = parser.parseFromString(productsItems, "text/html"); //--Analyse "productsItems" et renvoie un HTMLDocument -- 
        // console.log(displayShop);
        // console.log(productsItems);
        productsSection.appendChild(displayShop.body.firstChild); //--appendChild pour ajouter les noeuds du DOM --
      }
      console.log(productsSection);
}
  
//-- On affiche donc l'ensemble des produits sur la page d'acceuil avec text alternatif --
displayProducts();
