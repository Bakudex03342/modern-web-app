// Variables globales
let currentTool = 'calculator';
let calculatorInput = '';
let conversionData = {
    length: {
        metros: 1,
        kilómetros: 0.001,
        centímetros: 100,
        milímetros: 1000,
        pulgadas: 39.3701,
        pies: 3.28084,
        yardas: 1.09361
    },
    weight: {
        kilogramos: 1,
        gramos: 1000,
        libras: 2.20462,
        onzas: 35.274,
        toneladas: 0.001
    },
    temperature: {
        celsius: { base: true },
        fahrenheit: { base: false },
        kelvin: { base: false }
    },
    currency: {
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110,
        MXN: 20.5,
        CAD: 1.25,
        AUD: 1.35
    }
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeToolTabs();
    initializeConverter();
    updateConverter();
    
    // Navegación suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Navegación
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
        
        // Cerrar menú al hacer click en un enlace
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }
}

// Función para scroll suave a herramientas
function scrollToTools() {
    document.getElementById('tools').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Tabs de herramientas
function initializeToolTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const toolContents = document.querySelectorAll('.tool-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tool = button.getAttribute('data-tool');
            switchTool(tool);
        });
    });
}

function switchTool(tool) {
    currentTool = tool;
    
    // Actualizar botones activos
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
    
    // Mostrar contenido correspondiente
    document.querySelectorAll('.tool-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tool).classList.add('active');
}

// === CALCULADORA ===
function appendCalc(value) {
    const input = document.getElementById('calc-input');
    if (input.value === '0' || input.value === 'Error') {
        input.value = value;
    } else {
        input.value += value;
    }
    calculatorInput = input.value;
}

function clearCalc() {
    const input = document.getElementById('calc-input');
    input.value = '';
    calculatorInput = '';
}

function deleteLast() {
    const input = document.getElementById('calc-input');
    input.value = input.value.slice(0, -1);
    calculatorInput = input.value;
}

function calculateResult() {
    const input = document.getElementById('calc-input');
    try {
        // Reemplazar × por *
        let expression = input.value.replace(/×/g, '*');
        
        // Evaluar expresión de forma segura
        let result = eval(expression);
        
        // Formatear resultado
        if (result % 1 === 0) {
            input.value = result;
        } else {
            input.value = parseFloat(result.toFixed(8));
        }
        
        calculatorInput = input.value;
    } catch (error) {
        input.value = 'Error';
        calculatorInput = '';
    }
}

// Soporte para teclado en calculadora
document.addEventListener('keydown', function(event) {
    if (currentTool === 'calculator') {
        const key = event.key;
        const input = document.getElementById('calc-input');
        
        if ('0123456789+-*/.'.includes(key)) {
            event.preventDefault();
            appendCalc(key === '*' ? '×' : key);
        } else if (key === 'Enter' || key === '=') {
            event.preventDefault();
            calculateResult();
        } else if (key === 'Backspace') {
            event.preventDefault();
            deleteLast();
        } else if (key === 'Escape') {
            event.preventDefault();
            clearCalc();
        }
    }
});

// === CONVERSOR ===
function initializeConverter() {
    updateConverter();
}

function updateConverter() {
    const conversionType = document.getElementById('conversion-type').value;
    const fromUnit = document.getElementById('from-unit');
    const toUnit = document.getElementById('to-unit');
    
    // Limpiar opciones
    fromUnit.innerHTML = '';
    toUnit.innerHTML = '';
    
    // Agregar opciones según el tipo de conversión
    const units = Object.keys(conversionData[conversionType]);
    units.forEach(unit => {
        fromUnit.innerHTML += `<option value="${unit}">${unit.charAt(0).toUpperCase() + unit.slice(1)}</option>`;
        toUnit.innerHTML += `<option value="${unit}">${unit.charAt(0).toUpperCase() + unit.slice(1)}</option>`;
    });
    
    // Establecer valores por defecto
    if (units.length > 1) {
        toUnit.selectedIndex = 1;
    }
    
    convert();
}

function convert() {
    const conversionType = document.getElementById('conversion-type').value;
    const fromUnit = document.getElementById('from-unit').value;
    const toUnit = document.getElementById('to-unit').value;
    const fromValue = parseFloat(document.getElementById('from-value').value);
    const toValueInput = document.getElementById('to-value');
    
    if (isNaN(fromValue)) {
        toValueInput.value = '';
        return;
    }
    
    let result;
    
    if (conversionType === 'temperature') {
        result = convertTemperature(fromValue, fromUnit, toUnit);
    } else {
        const fromRate = conversionData[conversionType][fromUnit];
        const toRate = conversionData[conversionType][toUnit];
        result = (fromValue / fromRate) * toRate;
    }
    
    toValueInput.value = parseFloat(result.toFixed(6));
}

function convertTemperature(value, from, to) {
    // Convertir primero a Celsius
    let celsius = value;
    if (from === 'fahrenheit') {
        celsius = (value - 32) * 5/9;
    } else if (from === 'kelvin') {
        celsius = value - 273.15;
    }
    
    // Convertir de Celsius al destino
    if (to === 'fahrenheit') {
        return celsius * 9/5 + 32;
    } else if (to === 'kelvin') {
        return celsius + 273.15;
    }
    
    return celsius;
}

function swapUnits() {
    const fromUnit = document.getElementById('from-unit');
    const toUnit = document.getElementById('to-unit');
    const fromValue = document.getElementById('from-value');
    const toValue = document.getElementById('to-value');
    
    // Intercambiar unidades
    const tempUnit = fromUnit.value;
    fromUnit.value = toUnit.value;
    toUnit.value = tempUnit;
    
    // Intercambiar valores
    const tempValue = fromValue.value;
    fromValue.value = toValue.value;
    toValue.value = tempValue;
    
    convert();
}

// === CLIMA ===
function getWeather() {
    const city = document.getElementById('city-input').value.trim();
    const resultDiv = document.getElementById('weather-result');
    
    if (!city) {
        resultDiv.innerHTML = '<p style="color: #ff6b6b;">Por favor ingresa una ciudad</p>';
        return;
    }
    
    resultDiv.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Consultando clima...</p>';
    
    // Simulación de consulta de clima (API real requeriría clave)
    setTimeout(() => {
        const weatherData = {
            city: city,
            temperature: Math.floor(Math.random() * 30) + 5, // 5-35°C
            condition: ['Soleado', 'Nublado', 'Lluvia ligera', 'Parcialmente nublado'][Math.floor(Math.random() * 4)],
            humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
            windSpeed: Math.floor(Math.random() * 20) + 5 // 5-25 km/h
        };
        
        const weatherIcons = {
            'Soleado': '☀️',
            'Nublado': '☁️',
            'Lluvia ligera': '🌧️',
            'Parcialmente nublado': '⛅'
        };
        
        resultDiv.innerHTML = `
            <div style="text-align: left;">
                <h4 style="color: var(--primary-color); margin-bottom: 1rem;">${weatherIcons[weatherData.condition]} ${weatherData.city}</h4>
                <p><strong>Temperatura:</strong> ${weatherData.temperature}°C</p>
                <p><strong>Condición:</strong> ${weatherData.condition}</p>
                <p><strong>Humedad:</strong> ${weatherData.humidity}%</p>
                <p><strong>Viento:</strong> ${weatherData.windSpeed} km/h</p>
                <small style="color: var(--text-light); font-style: italic;">* Datos simulados para demostración</small>
            </div>
        `;
    }, 1500);
}

// === GENERADOR QR ===
function generateQR() {
    const text = document.getElementById('qr-text').value.trim();
    const canvas = document.getElementById('qr-canvas');
    
    if (!text) {
        alert('Por favor ingresa texto para generar el código QR');
        return;
    }
    
    // Simulación simple de QR usando canvas
    const ctx = canvas.getContext('2d');
    const size = 200;
    canvas.width = size;
    canvas.height = size;
    
    // Limpiar canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);
    
    // Generar patrón pseudo-QR
    ctx.fillStyle = 'black';
    const gridSize = 10;
    const cellSize = size / gridSize;
    
    // Generar patrón basado en el texto
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            // Usar hash simple del texto para determinar si pintar la celda
            const index = i * gridSize + j;
            const charCode = text.charCodeAt(index % text.length);
            if ((charCode + i + j) % 3 === 0) {
                ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
    }
    
    // Agregar esquinas características del QR
    drawQRCorner(ctx, 0, 0, cellSize);
    drawQRCorner(ctx, size - cellSize * 3, 0, cellSize);
    drawQRCorner(ctx, 0, size - cellSize * 3, cellSize);
    
    canvas.style.display = 'block';
    
    // Agregar botón de descarga
    setTimeout(() => {
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = '📥 Descargar QR';
        downloadBtn.style.marginTop = '15px';
        downloadBtn.style.background = 'var(--accent-color)';
        downloadBtn.style.color = 'white';
        downloadBtn.style.border = 'none';
        downloadBtn.style.padding = '10px 20px';
        downloadBtn.style.borderRadius = 'var(--radius)';
        downloadBtn.style.cursor = 'pointer';
        
        downloadBtn.onclick = () => {
            const link = document.createElement('a');
            link.download = `qr-code-${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
        };
        
        const result = document.getElementById('qr-result');
        const existingBtn = result.querySelector('button');
        if (existingBtn) {
            existingBtn.remove();
        }
        result.appendChild(downloadBtn);
    }, 100);
}

function drawQRCorner(ctx, x, y, cellSize) {
    // Marco exterior
    ctx.fillRect(x, y, cellSize * 3, cellSize * 3);
    ctx.fillStyle = 'white';
    ctx.fillRect(x + cellSize, y + cellSize, cellSize, cellSize);
    ctx.fillStyle = 'black';
}

// Efectos adicionales
document.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});

// Animaciones de entrada para las tarjetas
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observar elementos para animaciones
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.about-card, .tool-content');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Easter egg - Konami code
let konamiCode = [];
const konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.keyCode);
    if (konamiCode.length > konami.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.join(',') === konami.join(',')) {
        activateEasterEgg();
    }
});

function activateEasterEgg() {
    // Crear efecto de confeti
    const colors = ['#667eea', '#764ba2', '#f093fb', '#ff6b6b', '#ffa500'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            createConfetti(colors[Math.floor(Math.random() * colors.length)]);
        }, i * 50);
    }
    
    // Mostrar mensaje
    const message = document.createElement('div');
    message.textContent = '🎉 ¡Código Konami activado! ¡Eres genial! 🎉';
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
        color: white;
        padding: 20px 40px;
        border-radius: var(--radius);
        font-weight: bold;
        z-index: 10000;
        animation: bounce 0.5s ease;
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 3000);
}

function createConfetti(color) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${color};
        top: -10px;
        left: ${Math.random() * 100}vw;
        animation: fall 3s linear forwards;
        pointer-events: none;
        z-index: 9999;
    `;
    
    document.body.appendChild(confetti);
    
    setTimeout(() => {
        confetti.remove();
    }, 3000);
}

// Añadir estilos para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translate(-50%, -50%) translateY(0); }
        40% { transform: translate(-50%, -50%) translateY(-30px); }
        60% { transform: translate(-50%, -50%) translateY(-15px); }
    }
    
    @keyframes fall {
        0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);