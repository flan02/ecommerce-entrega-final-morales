let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let productosJSON = [];
let dolarVenta;
let lista

//Evento-Cuando la ventana está cargada
window.onload = () => {
    lista = document.getElementById("milista");
    document.getElementById("fila_prueba").style.background = "#32a3d8";
    obtenerValorDolar();
    //selector y evento change
    document.getElementById("miSeleccion").setAttribute("option", "pordefecto");
    document.getElementById("miSeleccion").onchange = () => ordenar();
};

function renderizarProductos() {
    //renderizamos los productos 
    console.log(productosJSON)
    for (const prod of productosJSON) {
        lista.innerHTML += (`<li class="col-sm-3 list-group-item">

        <img src="${prod.foto}" width="300px" height="250px">
        <p class=fuenteCards>${prod.modelo}</p>
        <p>Precio $ ${prod.precio}</p>
        <p>Precio USD/USDT $ ${(prod.precio / dolarVenta).toFixed(1)}</p>
        <button class="btn btn-success" id='btn${prod.id}'>COMPRAR</button>
    </li>`);
    }
    //EVENTOS
    productosJSON.forEach(prod => {
        //Evento para cada boton
        try {
        document.getElementById(`btn${prod.id}`).onclick = function () {
            agregarACarrito(prod);
        };
    }catch(error){                        //  # WARNING !  Cuando queres ejecutar una funcion que muestra elem. se envuelve en un try-catch. SIEMPRE
        console.error(error);
    }
    });
}

function agregarACarrito(productoNuevo) {
    let encontrado = carrito.find(p => p.id == productoNuevo.id);
    console.log(encontrado);
    if (encontrado == undefined) {
        let prodACarrito = {
            ...productoNuevo,
            cantidad: 1
        };
        carrito.push(prodACarrito);
        console.log(carrito);
        Swal.fire(
            '¡Producto agregado con extio!',
            productoNuevo.modelo,
            'success'
        );
        //agregamos una nueva fila a la tabla de carrito
        document.getElementById("tablabody").innerHTML += (`
            <tr id='fila${prodACarrito.id}'>
            <td> ${prodACarrito.id} </td>
            <td> ${prodACarrito.nombre}</td>
            <td id='${prodACarrito.id}'> ${prodACarrito.cantidad}</td>
            <td> ${prodACarrito.precio}</td>
            <td> <button class='btn btn-light' onclick='eliminar(${prodACarrito.id})'>🗑️</button>`);
    } else {
        //el producto ya existe en el carro
        //pido al carro la posicion del producto 
        let posicion = carrito.findIndex(p => p.id == productoNuevo.id);
        console.log(posicion);
        carrito[posicion].cantidad += 1;
        //con querySelector falla
        document.getElementById(productoNuevo.id).innerHTML = carrito[posicion].cantidad;
    }
    //siempre debo recalcular el total
    document.getElementById("gastoTotal").innerText = (`Total: $ ${calcularTotal()}`);
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function calcularTotal() {
    let suma = 0;
    for (const elemento of carrito) {
        suma = suma + (elemento.precio * elemento.cantidad);
    }
    return suma;
}

function eliminar(id) {
    let indice = carrito.findIndex(prod => prod.id == id);
    carrito.splice(indice, 1);//eliminando del carro
    let fila = document.getElementById(`fila${id}`);
    document.getElementById("tablabody").removeChild(fila);//eliminando de la tabla
    document.getElementById("gastoTotal").innerText = (`Total: $ ${calcularTotal()}`);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    Swal.fire("Producto eliminado del carro!")
}

function ordenar() {
    let seleccion = document.getElementById("miSeleccion").value;
    console.log(seleccion)
    if (seleccion == "menor") {
        productosJSON.sort(function (a, b) {
            return a.precio - b.precio
        });
    } else if (seleccion == "mayor") {
        productosJSON.sort(function (a, b) {
            return b.precio - a.precio
        });
    } else if (seleccion == "alfabetico") {
        productosJSON.sort(function (a, b) {
            return a.nombre.localeCompare(b.nombre);
        });
    }
    lista.innerHTML = "";
    renderizarProductos();
}

//GETJSON de productos.json
async function obtenerJSON() {
    const URLJSON = "productos.json"
    const resp = await fetch(URLJSON)
    const data = await resp.json()
    productosJSON = data;
    //ya tengo el dolar y los productos, renderizo las cartas
    renderizarProductos();
}


//function para obtener el valor del dolar blue en tiempo real
async function obtenerValorDolar() {
    const URLDOLAR = "https://api-dolar-argentina.herokuapp.com/api/dolarblue";
    const resp = await fetch(URLDOLAR)
    const data = await resp.json()
    document.getElementById("fila_prueba").innerHTML += (`<p class="valorDolar">Dolar compra: $ ${data.compra}  Dolar venta: $ ${data.venta}</p>`);
    dolarVenta = data.venta;
    //ya tengo los datos del dolar, llamo al json
    obtenerJSON();
}
