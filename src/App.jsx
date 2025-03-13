import React, { useState, useEffect } from "react";
import "./App.css";

// Componente Game - Contiene toda la lógica del juego
const Game = ({ onBack }) => {
  // Configuración del juego
  const screenWidth = 360;
  const carWidth = 40;
  const laneWidth = screenWidth / 3;

  // Estados del juego
  const [carLane, setCarLane] = useState(1);
  const [obstacles, setObstacles] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // Efecto para generar obstáculos
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      const isFast = Math.random() < 0.3;
      setObstacles((prev) => [
        ...prev,
        {
          lane: Math.floor(Math.random() * 3),
          top: 0,
          speed: isFast ? 25 : 15,
          points: isFast ? 40 : 10,
          color: isFast ? "orange" : "red",
        },
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, [gameOver]);

  // Efecto para mover los obstáculos
  useEffect(() => {
    if (gameOver) return;

    const moveObstacles = setInterval(() => {
      setObstacles((prev) => {
        return prev
          .map((obs) => {
            // Factor de velocidad basado en el puntaje
            const speedMultiplier = 1.5 + score / 1000;
            const newTop = obs.top + obs.speed * speedMultiplier;

            if (newTop > 500) {
              setScore((prevScore) => prevScore + obs.points);
              return null;
            }
            return { ...obs, top: newTop };
          })
          .filter(Boolean);
      });
    }, 100);

    return () => clearInterval(moveObstacles);
  }, [gameOver, score]);

  // Efecto para detectar colisiones
  useEffect(() => {
    obstacles.forEach((obs) => {
      if (obs.lane === carLane && obs.top > 440 && obs.top < 500) {
        setGameOver(true);
      }
    });
  }, [obstacles, carLane]);

  // Funciones para controlar el coche
  const moveLeft = () => {
    if (carLane > 0) setCarLane(carLane - 1);
  };

  const moveRight = () => {
    if (carLane < 2) setCarLane(carLane + 1);
  };

  // Control con teclado
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowLeft") moveLeft();
      if (e.key === "ArrowRight") moveRight();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [carLane]);

  // Función para reiniciar el juego
  const restartGame = () => {
    setGameOver(false);
    setScore(0);
    setObstacles([]);
    setCarLane(1);
  };

  return (
    <div className="game-container">
      <div className="road">
        {/* Líneas centrales y laterales */}
        {[...Array(10)].map((_, index) => (
          <React.Fragment key={`lines-${index}`}>
            <div
              className="lane-line"
              style={{
                top: `${index * 50}px`,
                left: `${screenWidth / 2 - 2.5}px`,
              }}
            />
            <div
              className="lane-line"
              style={{
                top: `${index * 50}px`,
                left: `${laneWidth / 2 - 2.5}px`,
              }}
            />
            <div
              className="lane-line"
              style={{
                top: `${index * 50}px`,
                left: `${2.5 * laneWidth - 2.5}px`,
              }}
            />
          </React.Fragment>
        ))}

        {/* Bordes de los carriles */}
        <div className="lane-border" style={{ left: `${laneWidth - 2.5}px` }} />
        <div
          className="lane-border"
          style={{ left: `${2 * laneWidth - 2.5}px` }}
        />
      </div>

      {/* Coche del jugador */}
      <div
        className="car"
        style={{
          left: `${carLane * laneWidth + laneWidth / 2 - carWidth / 2}px`,
        }}
      />

      {/* Obstáculos */}
      {obstacles.map((obs, index) => (
        <div
          key={index}
          className="obstacle"
          style={{
            left: `${obs.lane * laneWidth + laneWidth / 2 - carWidth / 2}px`,
            top: `${obs.top}px`,
            backgroundColor: obs.color,
          }}
        />
      ))}

      {/* Puntuación */}
      <div className="score">Puntuación: {score}</div>

      {/* Pantalla de Game Over */}
      {gameOver && (
        <div className="game-over-container">
          <div className="game-over-text">Game Over</div>
          <div className="final-score">Puntaje Final: {score}</div>
          <button onClick={restartGame} className="retry-button">
            Volver a Jugar
          </button>
        </div>
      )}

      {/* Controles */}
      <button onClick={moveLeft} className="left-button">
        ⬅️
      </button>
      <button onClick={moveRight} className="right-button">
        ➡️
      </button>
      <button onClick={onBack} className="back-button">
        Volver
      </button>
    </div>
  );
};

// Componente Modal reutilizable
const Modal = ({ title, children, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        {children}
        <button className="button close-button" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

// Componente App principal
export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="app-container">
      {isPlaying ? (
        <Game onBack={() => setIsPlaying(false)} />
      ) : (
        <div className="menu-container">
          <h1>🏎️ Juego de Coches</h1>
          <button
            className="button start-button"
            onClick={() => setIsPlaying(true)}
          >
            Iniciar Juego 🚗
          </button>
          <button
            className="button info-button"
            onClick={() => setShowInstructions(true)}
          >
            Instrucciones
          </button>
          <button
            className="button info-button"
            onClick={() => setShowAbout(true)}
          >
            Acerca de
          </button>
        </div>
      )}

      {showInstructions && (
        <Modal title="Instrucciones" onClose={() => setShowInstructions(false)}>
          <p>
            Mueve tu coche azul entre los tres carriles usando los botones de
            dirección o las flechas del teclado. Evita los obstáculos y acumula
            puntos GENIALESSSS.
          </p>
        </Modal>
      )}

      {showAbout && (
        <Modal title="Acerca de" onClose={() => setShowAbout(false)}>
          <p>
            Este juego fue desarrollado para simular una carretera con
            obstáculos esta carretera tiene lineas blancas, para la clase de
            Tecnologias Avanzadas de aplicaciones moviles.
          </p>
        </Modal>
      )}
    </div>
  );
}
