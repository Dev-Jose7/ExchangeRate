import { currencyCountry } from "./mapCurrency.js";

// Este evento se ejecuta cuando el DOM está completamente cargado y preparado.
document.addEventListener("DOMContentLoaded", function() {
    // Objeto para almacenar las tasas de cambio de divisas.
    let currencyData = {};
    let selectExchange = ""; // Variable para almacenar la moneda seleccionada para el intercambio.

    // Elementos del DOM relacionados con las divisas y la entrada de datos.
    const currencyBase = document.getElementById("currencyBase");
    const currencyExchange = document.getElementById("currencyExchange");
    const inputBase = document.getElementById("inputBase");
    const inputExchange = document.getElementById("inputExchange");
    const change = document.getElementById("change");
    const refresh = document.getElementById("refresh");

    // Imprime las opciones de divisas en los selectores.
    printCurrency();

    // Evento que se ejecuta cuando se cambia la moneda base.
    currencyBase.addEventListener("change", function() {
        printCurrency();
    });

    // Evento que se ejecuta cuando se cambia la moneda de intercambio.
    currencyExchange.addEventListener("change", function() {
        selectExchange = currencyExchange.value;
        printCurrency();
    });

    // Añade eventos de entrada y pulsación de teclas a todos los inputs.
    [...document.querySelectorAll("input")].forEach(input => {
        addEvent("keydown");
        addEvent("input");

        // Función para añadir eventos al input.
        function addEvent(type) {
            input.addEventListener(type, function(e) {
                // Calcula la tasa de cambio según el input modificado.
                if (e.target.id == "inputBase") {
                    calculateRate("base");
                } else if (e.target.id == "inputExchange") {
                    calculateRate("exchange");
                }
            });
        }
    });

    // Intercambia las monedas seleccionadas cuando se hace clic en el botón "change".
    change.addEventListener("click", function() {
        selectExchange = currencyBase.value;
        currencyBase.value = currencyExchange.value;
        printCurrency();
    });

    // Actualiza las tasas de cambio cuando se hace clic en el botón "refresh".
    refresh.addEventListener("click", async function() {
        await getData(currencyBase.value);
        calculateRate("base");
    });

    // Función asincrónica que obtiene los datos de las tasas de cambio desde una API.
    async function getData(currency) {
        await fetch(`https://open.er-api.com/v6/latest/${currency}`)
            .then(response => response.json())
            .then(data => currencyData = data.rates);
        console.log(currencyData); // Muestra los datos de las tasas de cambio obtenidos.
    }

    // Imprime las opciones de moneda y actualiza la interfaz de usuario.
    async function printCurrency() {
        loading("none", "flex"); // Muestra un indicador de carga.
        await getData(currencyBase.value); // Obtiene las tasas de cambio.

        // Rellena los selectores de moneda con las opciones disponibles.
        [...document.querySelectorAll("select")].forEach(select => {
            select.innerHTML = "";
            Object.keys(currencyData).forEach(currency => {
                if (currency != currencyBase.value) {   
                    select.innerHTML += `<option value="${currency}">${currency}</option>`;
                }
            });
        });

        // Establece la moneda de intercambio seleccionada.
        if (selectExchange == "") {
            currencyExchange.value = "COP"; // Valor por defecto.
        } else {
            currencyExchange.value = selectExchange;
        }

        countryCurrency(); // Actualiza las imágenes de las banderas.
        calculateRate("base"); // Calcula la tasa de cambio.
    }

    // Calcula la tasa de cambio en función del tipo de entrada.
    function calculateRate(type) {
        if (type == "base") {
            inputExchange.value = +inputBase.value * currencyData[currencyExchange.value];
        } else if (type == "exchange") {
            inputBase.value = +inputExchange.value / currencyData[currencyExchange.value];
        }
    }

    // Actualiza las imágenes de las banderas en la interfaz.
    function countryCurrency() {
        let imgCurrencyBase = `https://flagcdn.com/h24/${currencyCountry[currencyBase.value]}.png`;
        let imgCurrencyExchange = `https://flagcdn.com/h24/${currencyCountry[currencyExchange.value]}.png`;

        console.log(imgCurrencyBase);
        console.log(imgCurrencyExchange);

        currencyBase.closest(".currency").querySelector("img").src = imgCurrencyBase;
        currencyExchange.closest(".currency").querySelector("img").src = imgCurrencyExchange;

        // Muestra la interfaz una vez que las imágenes se hayan cargado.
        currencyExchange.closest(".currency").querySelector("img").addEventListener("load", function() {
            loading("unset", "none");
        });
    }

    // Muestra u oculta elementos de carga y de contenido.
    function loading(valueElement, valueLoading) {
        [...document.querySelectorAll(".currency")].forEach(element => {
            [...element.children].forEach(children => {
                children.style.display = valueElement;
            });
        });

        [...document.querySelectorAll(".loading")].forEach(loading => {
            loading.style.display = valueLoading;
        });
    }
});
