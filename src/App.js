import React, { useState } from "react";
import "./App.css";

// TUS URLS DE AWS (Actualizadas)
const API_URL_RECOMMEND =
  "https://l52y944285.execute-api.us-east-2.amazonaws.com/recommend";
const API_URL_SEARCH =
  "https://l52y944285.execute-api.us-east-2.amazonaws.com/search";
const API_URL_FAVORITES =
  "https://l52y944285.execute-api.us-east-2.amazonaws.com/favorites";

function App() {
  // Estados de Usuario
  const [username, setUsername] = useState("");

  // Estados de Controles
  const [tiempo, setTiempo] = useState(3);
  const [dificultad, setDificultad] = useState(3);
  const [costo, setCosto] = useState(3);
  const [ingredientesInput, setIngredientesInput] = useState("");

  // Estados de Resultados y UI
  const [resultados, setResultados] = useState([]);
  const [mensaje, setMensaje] = useState(
    "¡Bienvenido a Chefcito! Selecciona una opción para comenzar."
  );
  const [pestanaActiva, setPestanaActiva] = useState("recomendador");
  const [cargando, setCargando] = useState(false);

  // --- 1. RECOMENDAR ---
  const buscarRecomendaciones = () => {
    setMensaje("🔍 Analizando tus preferencias...");
    setCargando(true);
    setResultados([]);
    const url = `${API_URL_RECOMMEND}?tiempo=${tiempo}&dificultad=${dificultad}&costo=${costo}`;
    ejecutarPeticion(url);
  };

  // --- 2. BUSCAR POR INGREDIENTES ---
  const buscarPorIngredientes = () => {
    if (!ingredientesInput.trim()) {
      setMensaje("❌ Por favor escribe al menos un ingrediente.");
      return;
    }
    setMensaje("🥗 Buscando recetas con tus ingredientes...");
    setCargando(true);
    setResultados([]);
    const url = `${API_URL_SEARCH}?q=${encodeURIComponent(ingredientesInput)}`;
    ejecutarPeticion(url);
  };

  // --- 3. GUARDAR FAVORITO ---
  const guardarFavorito = async (recipeId, nombreReceta) => {
    if (!username.trim()) {
      setMensaje("Escribe tu nombre para guardar favoritos.");
      return;
    }

    try {
      const response = await fetch(API_URL_FAVORITES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          recipe_id: recipeId,
        }),
      });
      const data = await response.json();
      setMensaje(`✅ ¡"${nombreReceta}" guardada en tus favoritos!`);
    } catch (err) {
      console.error("Error guardando:", err);
      setMensaje("❌ Error al guardar la receta.");
    }
  };

  // --- 4. VER FAVORITOS ---
  const verFavoritos = () => {
    if (!username.trim()) {
      setMensaje("Escribe tu nombre para ver tus recetas guardadas.");
      setResultados([]);
      return;
    }

    setMensaje(`⭐ Buscando los favoritos de ${username}...`);
    setCargando(true);
    setResultados([]);

    const url = `${API_URL_FAVORITES}?username=${encodeURIComponent(username)}`;
    ejecutarPeticion(url);
  };

  // --- AUXILIAR: PETICIÓN GENÉRICA ---
  const ejecutarPeticion = (url) => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCargando(false);
        if (data.error) {
          setMensaje(`❌ Error: ${data.error}`);
        } else if (data.length === 0) {
          setMensaje("😔 No encontramos recetas con esos criterios.");
        } else {
          setResultados(data);
          setMensaje("");
        }
      })
      .catch((err) => {
        setCargando(false);
        console.error("Error API:", err);
        setMensaje("🌐 Error de conexión. Verifica tu internet.");
      });
  };

  // --- MANEJADOR DE PESTAÑAS ---
  const cambiarPestana = (pestana) => {
    setPestanaActiva(pestana);
    setResultados([]);

    if (pestana === "recomendador")
      setMensaje("Ajusta los parámetros y encuentra tu receta ideal.");
    if (pestana === "buscador")
      setMensaje("Escribe los ingredientes que tienes disponibles.");
    if (pestana === "favoritos") {
      if (username) verFavoritos();
      else setMensaje("Escribe tu nombre para ver tus favoritos.");
    }
  };

  return (
    <div className="App">
      {/* HEADER MODERNO */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">🍳</div>
            <div className="titles">
              <h1>Chefcito</h1>
              <p>Tu asistente culinario inteligente</p>
            </div>
          </div>

          {/* INPUT DE USUARIO MODERNO */}
          <div className="user-section">
            <div className="input-wrapper">
              <span className="input-icon"></span>
              <input
                type="text"
                className="user-input"
                placeholder="Tu nombre para guardar favoritos"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* NAVEGACIÓN MODERNA */}
      <nav className="app-navigation">
        <div className="nav-container">
          <button
            className={`nav-btn ${
              pestanaActiva === "recomendador" ? "active" : ""
            }`}
            onClick={() => cambiarPestana("recomendador")}
          >
            <span className="nav-text">Recomendador</span>
          </button>

          <button
            className={`nav-btn ${
              pestanaActiva === "buscador" ? "active" : ""
            }`}
            onClick={() => cambiarPestana("buscador")}
          >
            
            <span className="nav-text">Refrigerador</span>
          </button>

          <button
            className={`nav-btn ${
              pestanaActiva === "favoritos" ? "active" : ""
            }`}
            onClick={() => cambiarPestana("favoritos")}
          >
            <span className="nav-text">Mis Favoritos</span>
          </button>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <main className="app-main">
        {/* CONTROLES (No se muestran en favoritos) */}
        {pestanaActiva !== "favoritos" && (
          <section className="controls-section">
            <div className="controls-card">
              {pestanaActiva === "recomendador" ? (
                <>
                  <h2>Personaliza tu búsqueda</h2>
                  <p className="section-description">
                    Ajusta los parámetros según tus preferencias
                  </p>

                  <div className="sliders-grid">
                    {/* TIEMPO */}
                    <div className="slider-item">
                      <div className="slider-header">
                        <span className="slider-label">Tiempo de preparación</span>
                        <span className="slider-value">{tiempo}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={tiempo}
                        onChange={(e) => setTiempo(e.target.value)}
                        className="compact-slider"
                      />
                      <div className="slider-scale">
                        <span className="scale-number">1</span>
                        <span className="scale-number">2</span>
                        <span className="scale-number">3</span>
                        <span className="scale-number">4</span>
                        <span className="scale-number">5</span>
                      </div>
                    </div>

                    <div className="slider-separator"></div>

                    {/* DIFICULTAD */}
                    <div className="slider-item">
                      <div className="slider-header">
                        <span className="slider-label">Dificultad de preparación</span>
                        <span className="slider-value">{dificultad}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={dificultad}
                        onChange={(e) => setDificultad(e.target.value)}
                        className="compact-slider"
                      />
                      <div className="slider-scale">
                        <span className="scale-number">1</span>
                        <span className="scale-number">2</span>
                        <span className="scale-number">3</span>
                        <span className="scale-number">4</span>
                        <span className="scale-number">5</span>
                      </div>
                    </div>

                    <div className="slider-separator"></div>

                    {/* COSTO */}
                    <div className="slider-item">
                      <div className="slider-header">
                        <span className="slider-label">Costo de ingredientes</span>
                        <span className="slider-value">{costo}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={costo}
                        onChange={(e) => setCosto(e.target.value)}
                        className="compact-slider"
                      />
                      <div className="slider-scale">
                        <span className="scale-number">1</span>
                        <span className="scale-number">2</span>
                        <span className="scale-number">3</span>
                        <span className="scale-number">4</span>
                        <span className="scale-number">5</span>
                      </div>
                    </div>
                  </div>

                  <button
                    className="primary-btn"
                    onClick={buscarRecomendaciones}
                    disabled={cargando}
                  >
                    {cargando ? "🔍 Buscando..." : "Encontrar Recetas"}
                  </button>
                </>
              ) : (
                <>
                  <h2>¿Qué tienes en la cocina?</h2>
                  <p className="section-description">
                    Escribe los ingredientes separados por comas
                  </p>

                  <div className="search-input-wrapper">
                    <span className="search-icon"></span>
                    <input
                      type="text"
                      className="search-input"
                      value={ingredientesInput}
                      onChange={(e) => setIngredientesInput(e.target.value)}
                      placeholder="Ej: pollo, arroz, limón, cebolla..."
                      onKeyPress={(e) =>
                        e.key === "Enter" && buscarPorIngredientes()
                      }
                    />
                  </div>

                  <button
                    className="primary-btn"
                    onClick={buscarPorIngredientes}
                    disabled={cargando || !ingredientesInput.trim()}
                  >
                    {cargando ? "🍳 Cocinando..." : "¡Cocinar con esto!"}
                  </button>
                </>
              )}
            </div>
          </section>
        )}

        {/* ESTADO/MENSAJES */}
        {(mensaje || cargando) && (
          <section className="status-section">
            <div className="status-card">
              {cargando ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Buscando las mejores recetas...</p>
                </div>
              ) : (
                <p className="status-message">{mensaje}</p>
              )}
            </div>
          </section>
        )}

        {/* RESULTADOS */}
        {resultados.length > 0 && (
          <section className="results-section">
            <div className="results-header">
              <h2>🍽️ Recetas Encontradas</h2>
              <span className="results-count">
                {resultados.length} receta{resultados.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="recipes-grid">
              {resultados.map((receta, index) => (
                <div className="recipe-card" key={receta.recipe_id || index}>
                  <div className="recipe-header">
                    <h3 className="recipe-title">{receta.nombre}</h3>
                    {pestanaActiva !== "favoritos" && (
                      <button
                        className="favorite-btn"
                        onClick={() =>
                          guardarFavorito(receta.recipe_id, receta.nombre)
                        }
                        title="Guardar en favoritos"
                      >
                        ⭐
                      </button>
                    )}
                  </div>

                  <div className="recipe-content">
                    <div className="ingredients-section">
                      <h4>🧂 Ingredientes</h4>
                      <p className="ingredients-list">{receta.ingredientes}</p>
                    </div>

                    {receta.link && (
                      <div className="recipe-actions">
                        <a
                          href={receta.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="recipe-link"
                        >
                          📖 Ver Receta Completa
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* FOOTER MODERNO */}
      <footer className="app-footer">
        <p>Desarrollado con AWS Serverless • Chefcito</p>
      </footer>
    </div>
  );
}

export default App;