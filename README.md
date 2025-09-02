
# Apocalipsis Zombie RPG (Vite + React + TS)

- Día en tiempo real: 35 minutos (HUD con reloj y fases).
- Eventos aleatorios con cuenta regresiva y barra.
- Mazo de **Decisión** (morado) y **Combate** (rojo) con barajar y reintegrar descartes.
- Moral 0% = Game Over.
- Eliminar jugadores (permanente) y editar nombres.
- Inventario con **Alijo del Campamento** y transferencia de ítems.
- Explorar consume tiempo y genera materiales/combates/eventos.
- Pasar la noche resuelve amenazas y avanza el día.
- Narrativa contextual en el registro.
- Citas de filósofos en el HUD.

## Dev
```bash
npm i
npm run dev
```
## Build estático (para Render)
```bash
npm run build
npm run preview
```
Publica la carpeta `dist`.

## Nuevo flujo de inicio

1. Pantalla de Inicio → botón **Comenzar**.
2. **Manual** (2 páginas) → **Iniciar juego**.
3. El juego inicia en **PAUSA**, con personaje demo **jugador1** (editable).
4. Aparece un toast de bienvenida (cerrable) con instrucciones.
5. El tiempo solo avanza al presionar **Play**. Se puede pausar en cualquier momento.
6. La gestión de personajes (agregar/editar) está disponible dentro del juego.
