import StartGame from "./game/main";

document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener('load', () => {
    setTimeout(() => {
      StartGame('game-container');
    }, 100); // delay to ensure correct viewport size
  });

  StartGame("game-container");
});
