import {
    data
} from './products.js';

const productos = data.products;

const zonaProductos = document.body.children[1].firstElementChild;

const zonaCarrito = zonaProductos.nextElementSibling.children[1];

const precioCarro = zonaCarrito.nextElementSibling.children[0];

//Checkar si existe un carrito con los elementos
if (localStorage.getItem('carrito') == null) {
    localStorage.setItem('carrito', JSON.stringify({
        productos: []
    }));
    crearProductos(productos);
} else {
    let productosCarrito = JSON.parse(localStorage.getItem('carrito'));
    if (productosCarrito.productos.length != 0) {
        productos.forEach(producto => {
            let existeCarro = productosCarrito.productos.find(productoCarro => productoCarro == producto.code);
            if (typeof existeCarro == 'undefined') {
                let agrupador = crearProductoLista(producto);
                zonaProductos.appendChild(agrupador);
            } else {
                let agrupadorProducto = crearProductoCarro(producto);
                zonaCarrito.appendChild(agrupadorProducto);
            }
        })
    } else {
        crearProductos(productos);
    }
}

//Comprueba si existe un precio para el carro, nada seguro porque borras la cookie y todo es gratis :)
if(getCookie('precioCarro')!=null){
    calcularPrecio();
}

//Calcular el precio de los productos del localStorage
function calcularPrecio() {
    let productosCarrito = JSON.parse(localStorage.getItem('carrito'));
    let suma = 0;
    let precios = [];
    productosCarrito.productos.forEach(productoCarro => {
        let existeProducto = productos.find(producto => producto.code == productoCarro);
        if (typeof existeProducto != 'undefined') {
            precios.push(existeProducto.price);
        }
    });
    suma = precios.reduce(function (acumulador, avance) {
        return acumulador + avance;
    }, 0);
    setCookie('precioCarro',suma,9999);
    precioCarro.textContent = `${suma}€`;
}

//Crea los productos
function crearProductos(productos) {
    productos.forEach(producto => {
        let agrupador = crearProductoLista(producto);
        zonaProductos.appendChild(agrupador);
    });
}

//Crea contenedores de tipo producto
function crearProductoLista(producto){
    let agrupador = createNode('div', '', ['productCard'], [{
        name: 'id',
        value: producto.code
    }]);
    agrupador.appendChild(createNode('img', '', [], [{
        name: 'src',
        value: `./img/${producto.image}`
    }]));
    agrupador.appendChild(createNode('h3', producto.name, [], []));
    agrupador.appendChild(createNode('p', producto.description, [], []));
    agrupador.appendChild(createNode('h3', `${producto.price}€`, [], []));
    let btnCompra = createNode('button', 'Comprar', [], []);
    btnCompra.addEventListener('click', addCarrito);
    agrupador.appendChild(btnCompra);
    return agrupador;
}

//Crear los contenedores para carrito
function crearProductoCarro(producto){
    let agrupadorProducto = createNode('div', '', ['productCart'], [{
        name: 'id',
        value: producto.code
    }]);
    agrupadorProducto.appendChild(createNode('img', '', [], [{
        name: 'src',
        value: `./img/${producto.image}`
    }]));
    let agrupadorInfo = createNode('div', '', ['productCartInfo'], []);
    agrupadorInfo.appendChild(createNode('p', producto.name, [], []));
    agrupadorInfo.appendChild(createNode('p', `${producto.price}€`, [], []));
    agrupadorProducto.appendChild(agrupadorInfo);
    let btnBorrar = createNode('button', 'Borrar', [], []);
    btnBorrar.addEventListener('click', delCarrito);
    agrupadorProducto.appendChild(btnBorrar);
    return agrupadorProducto;
}

//Evento para añadir al carrito
function addCarrito(e) {
    let productoCode = e.target.parentNode.id;
    let agrupadorLista = e.target.parentNode;
    let productosCarrito = JSON.parse(localStorage.getItem('carrito'));
    productosCarrito.productos.push(productoCode);
    localStorage.setItem('carrito', JSON.stringify(productosCarrito));
    borrarNodos(agrupadorLista);
    let producto = productos.find(producto => producto.code == productoCode);
    let agrupadorProducto = crearProductoCarro(producto);
    zonaCarrito.appendChild(agrupadorProducto);
    calcularPrecio();
}

//Evento para borrar del carrito
function delCarrito(e) {
    let agrupadorLista = e.target.parentNode;
    let productoCode = agrupadorLista.id;
    let productosCarrito = JSON.parse(localStorage.getItem('carrito'));
    productosCarrito.productos = borrarElemArray(productosCarrito.productos, productoCode);
    localStorage.setItem('carrito', JSON.stringify(productosCarrito));
    borrarNodos(agrupadorLista);
    let producto = productos.find(producto => producto.code == productoCode);
    let agrupador = crearProductoLista(producto);
    zonaProductos.appendChild(agrupador);
    calcularPrecio();
}

//Para crear nodos
function createNode(nodeType, nodeText, nodeClasess, nodeAttributtes) {
    let node = document.createElement(nodeType);
    if (nodeText != "" && nodeText != null) {
        node.appendChild(document.createTextNode(nodeText));
    }
    if (nodeClasess.length > 0) {
        nodeClasess.forEach(clss => node.classList.add(clss));
    }
    if (nodeAttributtes.length > 0) {
        nodeAttributtes.forEach(attributte => node.setAttribute(attributte.name, attributte.value));
    }
    return node;
}

//Borrar nodos incluido el padre
function borrarNodos(padre) {
    while (padre.firstChild) {
        padre.removeChild(padre.firstChild);
    }
    padre.remove();
}

//Borrar el elemento que queramos del array que deseemos
function borrarElemArray(array, elem) {
    let index = array.indexOf(elem);
    while (index > -1) {
        array.splice(index, 1);
        index = array.indexOf(elem);
    }
    return array;
}

//Crea/setea la cookie
function setCookie(name, value, hours) {
    let expdate = new Date();
    expdate.setTime(expdate.getTime() + hours * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires = ${expdate.toUTCString()}`;
}

//Comprueba si existe la cookie
function getCookie(name) {
    let index = document.cookie.indexOf(name + '=');
    if (index == -1) return null;
    index = document.cookie.indexOf('=', index) + 1;
    let endstr = document.cookie.indexOf(';', index);
    if (endstr == -1) {
        endstr = document.cookie.length;
    }
    return decodeURIComponent(document.cookie.substring(index, endstr));
}