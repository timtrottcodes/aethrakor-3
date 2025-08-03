import StartGame from "./game/main";

window.addEventListener('load', () => {
  setTimeout(() => {
    StartGame('game-container');
  }, 100); // optional: delay to ensure full viewport
});
