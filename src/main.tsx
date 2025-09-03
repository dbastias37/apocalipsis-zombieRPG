
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import { LevelProvider } from '@/state/levelStore'

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <LevelProvider>
      <App />
    </LevelProvider>
  </React.StrictMode>
)
// SOLUCIÓN: Reemplazar completamente el campo de nombre problemático
// Copia y pega este código al final de tu archivo JavaScript principal

(function() {
    // Esperamos a que la página cargue completamente
    document.addEventListener('DOMContentLoaded', function() {
        replaceNameField();
    });
    
    // Si la página ya está cargada, ejecutamos inmediatamente
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', replaceNameField);
    } else {
        replaceNameField();
    }
    
    function replaceNameField() {
        // PASO 1: Encontrar y eliminar el campo problemático
        const oldInputs = [
            document.getElementById('nameInput'),
            document.getElementById('playerName'),
            document.getElementById('name'),
            document.querySelector('input[placeholder*="nombre" i]'),
            document.querySelector('input[placeholder*="name" i]'),
            document.querySelector('input[type="text"]:first-of-type')
        ];
        
        let targetContainer = null;
        let oldInput = null;
        
        // Buscar el campo existente
        for (let input of oldInputs) {
            if (input && input.parentNode) {
                oldInput = input;
                targetContainer = input.parentNode;
                break;
            }
        }
        
        // Si no encontramos el campo, buscar el contenedor más probable
        if (!targetContainer) {
            targetContainer = document.body;
        }
        
        // PASO 2: Crear el nuevo campo completamente independiente
        const newNameContainer = document.createElement('div');
        newNameContainer.innerHTML = `
            <div style="margin: 10px 0;">
                <label for="newPlayerName" style="display: block; margin-bottom: 5px;">
                    Nombre del Jugador:
                </label>
                <input 
                    type="text" 
                    id="newPlayerName" 
                    maxlength="20"
                    placeholder="Ingresa tu nombre"
                    style="
                        padding: 8px 12px;
                        border: 2px solid #333;
                        border-radius: 4px;
                        font-size: 16px;
                        width: 200px;
                        background: #f9f9f9;
                    "
                >
                <div id="nameStatus" style="
                    margin-top: 5px;
                    font-size: 12px;
                    min-height: 20px;
                    color: #666;
                "></div>
            </div>
        `;
        
        // PASO 3: Eliminar el campo viejo y agregar el nuevo
        if (oldInput) {
            oldInput.style.display = 'none'; // Ocultamos en lugar de eliminar por seguridad
        }
        
        targetContainer.appendChild(newNameContainer);
        
        // PASO 4: Configurar el nuevo campo con manejo de eventos robusto
        const newInput = document.getElementById('newPlayerName');
        const statusDiv = document.getElementById('nameStatus');
        
        let currentName = '';
        let updateTimeout = null;
        
        // Función para actualizar el nombre (sin tocar el input)
        function updatePlayerName(name) {
            currentName = name.trim();
            
            // Actualizar estado visual
            if (currentName.length === 0) {
                statusDiv.textContent = 'Ingresa tu nombre';
                statusDiv.style.color = '#666';
            } else if (currentName.length < 2) {
                statusDiv.textContent = 'Muy corto (mín. 2 caracteres)';
                statusDiv.style.color = '#e74c3c';
            } else {
                statusDiv.textContent = `✓ Nombre: ${currentName}`;
                statusDiv.style.color = '#27ae60';
            }
            
            // AQUÍ conectas con tu lógica del juego
            // Reemplaza 'playerName' por tu variable global del juego
            if (typeof window.playerName !== 'undefined') {
                window.playerName = currentName;
            }
            if (typeof window.gameState !== 'undefined' && window.gameState.player) {
                window.gameState.player.name = currentName;
            }
            if (typeof window.player !== 'undefined') {
                window.player.name = currentName;
            }
            
            // Disparar evento personalizado para tu juego
            window.dispatchEvent(new CustomEvent('playerNameChanged', { 
                detail: { name: currentName }
            }));
        }
        
        // Evento principal - solo uno, sin conflictos
        newInput.addEventListener('input', function(event) {
            clearTimeout(updateTimeout);
            
            // Debounce para evitar actualizaciones excesivas
            updateTimeout = setTimeout(() => {
                updatePlayerName(event.target.value);
            }, 100);
        });
        
        // Validación al perder el foco
        newInput.addEventListener('blur', function() {
            if (currentName.length > 0 && currentName.length < 2) {
                newInput.focus();
                statusDiv.textContent = 'El nombre debe tener al menos 2 caracteres';
                statusDiv.style.color = '#e74c3c';
            }
        });
        
        // PASO 5: Función global para obtener el nombre desde otras partes del código
        window.getPlayerName = function() {
            return currentName;
        };
        
        window.setPlayerName = function(name) {
            newInput.value = name;
            updatePlayerName(name);
        };
        
        console.log('✅ Nuevo campo de nombre instalado correctamente');
    }
})();
