import React, { useState, useEffect } from "react";
import "./App.css";

// --- TUS URLS DE AWS ---
const API_URL_RECOMMEND = "https://0b9lsf26yg.execute-api.us-east-2.amazonaws.com/recommend";
const API_URL_SEARCH    = "https://0b9lsf26yg.execute-api.us-east-2.amazonaws.com/search";
const API_URL_FAVORITES = "https://0b9lsf26yg.execute-api.us-east-2.amazonaws.com/favorites";
const API_URL_NUTRITION = "https://0b9lsf26yg.execute-api.us-east-2.amazonaws.com/nutrition";

function App() {
  const [username, setUsername] = useState("");
  
  // --- CAMBIO: Valores iniciales en 5 (Mitad de la escala 1-10) ---
  const [tiempo, setTiempo] = useState(5);
  const [dificultad, setDificultad] = useState(5);
  const [costo, setCosto] = useState(5);
  
  const [ingredientesInput, setIngredientesInput] = useState("");
  const [objetivo, setObjetivo] = useState("mantener");
  const [evitar, setEvitar] = useState(""); 
  const [resultados, setResultados] = useState([]);
  const [mensaje, setMensaje] = useState("¡Bienvenido a Chefcito! Selecciona una opción para comenzar.");
  const [pestanaActiva, setPestanaActiva] = useState("recomendador");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (pestanaActiva === "nutricion" && username) {
      cargarPerfil();
    }
  }, [pestanaActiva, username]);

  // --- FUNCIONES ---
  const buscarRecomendaciones = () => {
    setMensaje("🔍 Analizando tus preferencias con IA...");
    setCargando(true);
    setResultados([]);
    const url = `${API_URL_RECOMMEND}?tiempo=${tiempo}&dificultad=${dificultad}&costo=${costo}&username=${encodeURIComponent(username)}`;
    ejecutarPeticion(url);
  };

  const buscarPorIngredientes = () => {
    if (!ingredientesInput.trim()) {
      setMensaje("❌ Escribe qué tienes en la refri (Ej: tengo pollito).");
      return;
    }
    setMensaje("🤔 Chefcito está pensando qué cocinar...");
    setCargando(true);
    setResultados([]);
    const url = `${API_URL_SEARCH}?q=${encodeURIComponent(ingredientesInput)}&username=${encodeURIComponent(username)}`;
    ejecutarPeticion(url);
  };

  const guardarFavorito = async (recipeId, nombreReceta) => {
    if (!username.trim()) {
      setMensaje("Escribe tu nombre para guardar favoritos.");
      return;
    }
    try {
      await fetch(API_URL_FAVORITES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, recipe_id: recipeId }),
      });
      setMensaje(`✅ ¡"${nombreReceta}" guardada en tus favoritos!`);
    } catch (err) {
      console.error("Error guardando:", err);
      setMensaje("❌ Error al guardar la receta.");
    }
  };

  const verFavoritos = () => {
    if (!username.trim()) {
      setMensaje("Escribe tu nombre para ver tus recetas guardadas.");
      setResultados([]);
      return;
    }
    setMensaje(`Buscando los favoritos de ${username}...`);
    setCargando(true);
    setResultados([]);
    const url = `${API_URL_FAVORITES}?username=${encodeURIComponent(username)}`;
    ejecutarPeticion(url);
  };

  const guardarPerfil = async () => {
    if (!username.trim()) {
      setMensaje("Escribe tu nombre arriba primero.");
      return;
    }
    try {
      setCargando(true);
      const res = await fetch(API_URL_NUTRITION, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, objetivo, evitar }), 
      });
      const data = await res.json();
      setCargando(false);
      setMensaje(data.message || "✅ Perfil actualizado correctamente.");
    } catch (err) {
      setCargando(false);
      setMensaje("❌ Error guardando perfil.");
    }
  };

  const cargarPerfil = async () => {
    try {
      setCargando(true);
      const res = await fetch(`${API_URL_NUTRITION}?username=${encodeURIComponent(username)}`);
      if (res.ok) {
        const data = await res.json();
        setObjetivo(data.objetivo || "mantener");
        setEvitar(data.evitar || ""); 
        setMensaje("Perfil cargado. Puedes editarlo aquí.");
      } else {
        setMensaje("Configura tu perfil nutricional por primera vez.");
      }
    } catch (err) {
      console.error("Error cargando perfil", err);
    } finally {
        setCargando(false);
    }
  };

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

  const cambiarPestana = (pestana) => {
    setPestanaActiva(pestana);
    setResultados([]);
    if (pestana === "recomendador") setMensaje("Ajusta los parámetros y encuentra tu receta ideal.");
    if (pestana === "buscador") setMensaje("Escribe los ingredientes que tienes disponibles.");
    if (pestana === "favoritos") {
      if (username) verFavoritos();
      else setMensaje("Escribe tu nombre para ver tus favoritos.");
    }
    if (pestana === "nutricion") {
       if (username) setMensaje("Cargando perfil...");
       else setMensaje("Escribe tu nombre para configurar tu dieta.");
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">🐭</div>
            <div className="titles">
              <h1>Chefcito</h1>
              <p>Tu asistente culinario inteligente</p>
            </div>
          </div>
          <div className="user-section">
            <div className="input-wrapper">
              <span className="input-icon"></span>
              <input type="text" className="user-input" placeholder="" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
          </div>
        </div>
      </header>

      <nav className="app-navigation">
        <div className="nav-container">
          <button className={`nav-btn ${pestanaActiva === "recomendador" ? "active" : ""}`} onClick={() => cambiarPestana("recomendador")}><span className="nav-text">Recomendador</span></button>
          <button className={`nav-btn ${pestanaActiva === "buscador" ? "active" : ""}`} onClick={() => cambiarPestana("buscador")}><span className="nav-text">Refrigerador</span></button>
          <button className={`nav-btn ${pestanaActiva === "favoritos" ? "active" : ""}`} onClick={() => cambiarPestana("favoritos")}><span className="nav-text">Mis Favoritos</span></button>
          <button className={`nav-btn ${pestanaActiva === "nutricion" ? "active" : ""}`} onClick={() => cambiarPestana("nutricion")}><span className="nav-text">Mi Dieta</span></button>
        </div>
      </nav>

      <main className="app-main">
        {pestanaActiva === "recomendador" && (
          <section className="controls-section">
            <div className="controls-card">
              <h2>Personaliza tu búsqueda</h2>
              <p className="section-description">Ajusta los parámetros según tus preferencias</p>
              
              {/* --- CAMBIO: SLIDERS DEL 1 AL 10 --- */}
              <div className="sliders-grid">
                <div className="slider-item">
                  <div className="slider-header"><span className="slider-label">Tiempo de preparación</span><span className="slider-value">{tiempo}</span></div>
                  <input type="range" min="1" max="10" value={tiempo} onChange={(e) => setTiempo(e.target.value)} className="compact-slider" />
                </div>
                <div className="slider-item">
                  <div className="slider-header"><span className="slider-label">Dificultad de preparación</span><span className="slider-value">{dificultad}</span></div>
                  <input type="range" min="1" max="10" value={dificultad} onChange={(e) => setDificultad(e.target.value)} className="compact-slider" />
                </div>
                <div className="slider-item">
                  <div className="slider-header"><span className="slider-label">Costo de ingredientes</span><span className="slider-value">{costo}</span></div>
                  <input type="range" min="1" max="10" value={costo} onChange={(e) => setCosto(e.target.value)} className="compact-slider" />
                </div>
              </div>

              <button className="primary-btn" onClick={buscarRecomendaciones} disabled={cargando}>{cargando ? "Buscando..." : "Encontrar Recetas"}</button>
            </div>
          </section>
        )}

        {pestanaActiva === "buscador" && (
          <section className="controls-section">
            <div className="controls-card">
              <h2>¿Qué tienes en la cocina?</h2>
              <p className="section-description">Escribe los ingredientes separados que tienes en tu cocina</p>
              <div className="search-input-wrapper">
                <input type="text" className="search-input" value={ingredientesInput} onChange={(e) => setIngredientesInput(e.target.value)} placeholder="" onKeyPress={(e) => e.key === "Enter" && buscarPorIngredientes()} />
              </div>
              <button className="primary-btn" onClick={buscarPorIngredientes} disabled={cargando || !ingredientesInput.trim()}>{cargando ? "Cocinando..." : "¡Cocinar con esto!"}</button>
            </div>
          </section>
        )}

        {pestanaActiva === "nutricion" && (
            <section className="controls-section">
                <div className="controls-card">
                    <h2>Tu Perfil Nutricional</h2>
                    <p className="section-description"></p>
                    <div style={{display:'flex', flexDirection:'column', gap:'20px', textAlign:'left'}}>
                        <div>
                            <label className="slider-label">Objetivo:</label>
                            <select className="search-input" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} style={{marginTop:'5px', padding: '0.8rem'}}>
                                <option value="bajar">Bajar de Peso</option>
                                <option value="mantener">Mantenerse Saludable</option>
                                <option value="subir">Ganar Masa Muscular</option>
                            </select>
                        </div>
                        <div>
                            <label className="slider-label">Evitar Ingredientes:</label>
                            <p style={{fontSize:'0.85rem', color:'#94a3b8', marginBottom:'8px', marginTop:'2px'}}>
                                Escribe aquí tus alergias, restricciones o comidas que odias.
                            </p>
                            <input type="text" className="search-input" placeholder="" value={evitar} onChange={(e) => setEvitar(e.target.value)} />
                        </div>
                        <button className="primary-btn" onClick={guardarPerfil} disabled={cargando}>{cargando ? "💾 Guardando..." : "Guardar Perfil"}</button>
                    </div>
                </div>
            </section>
        )}

        {(mensaje || cargando) && (
          <section className="status-section">
            <div className="status-card">
              {cargando ? (
                <div className="loading-spinner"><div className="spinner"></div><p>Procesando...</p></div>
              ) : (
                <p className="status-message">{mensaje}</p>
              )}
            </div>
          </section>
        )}

        {resultados.length > 0 && (
          <section className="results-section">
            <div className="results-header">
              <h2>🍽️ Recetas Encontradas</h2>
              <span className="results-count">{resultados.length} receta{resultados.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="recipes-grid">
              {resultados.map((receta, index) => (
                <div className="recipe-card" key={receta.recipe_id || index}>
                  <div className="recipe-header">
                    <div style={{display:'flex', flexDirection:'column', alignItems:'flex-start', width:'100%'}}>
                        <h3 className="recipe-title">{receta.nombre}</h3>
                        
                        {/* --- ETIQUETAS FILTRADAS --- */}
                        {receta.etiquetas && receta.etiquetas.length > 0 && (
                            <div className="tags-container">
                                {receta.etiquetas.map((tag, i) => {
                                    let colorClass = "bg-gray";
                                    const t = tag.toUpperCase();
                                    
                                    // 1. PRIORIDAD ALTA: AZUL Y VERDE
                                    if(t.includes("PROTEÍNA") || t.includes("PROTEINA") || t.includes("POLLO") || t.includes("CARNE") || t.includes("PESCADO")) {
                                        colorClass = "bg-blue";
                                    }
                                    else if(t.includes("KETO") || t.includes("FIBRA") || t.includes("SALUDABLE") || t.includes("BAJO") || t.includes("VEGANO") || t.includes("SIN")) {
                                        colorClass = "bg-green";
                                    }
                                    // 2. PRIORIDAD MEDIA: ROJO
                                    else if(t.includes("GRASA") || t.includes("AZÚCAR") || t.includes("SODIO") || t.includes("FRITO") || t.includes("ALTO")) {
                                        colorClass = "bg-red";
                                    }
                                    // 3. PRIORIDAD BAJA: NARANJA
                                    else if(t.includes("CALORÍAS") || t.includes("CARBOS") || t.includes("WRAP") || t.includes("PASTA") || t.includes("HARINA")) {
                                        colorClass = "bg-orange";
                                    }

                                    // SI SE QUEDÓ EN GRIS, NO SE MUESTRA
                                    if (colorClass === "bg-gray") return null;

                                    return <span key={i} className={`badge ${colorClass}`}>{tag}</span>
                                })}
                            </div>
                        )}
                    </div>
                    {pestanaActiva !== "favoritos" && (
                      <button className="favorite-btn" onClick={() => guardarFavorito(receta.recipe_id, receta.nombre)} title="Guardar en favoritos">⭐</button>
                    )}
                  </div>
                  <div className="recipe-content">
                    <div className="ingredients-section">
                      <h4>🧂 Ingredientes</h4>
                      <p className="ingredients-list">{receta.ingredientes}</p>
                    </div>
                    {receta.consejo && (
                        <div className="nutrition-tip">
                            <span className="tip-title">💡 Chefcito Dice:</span>
                            "{receta.consejo}"
                        </div>
                    )}
                    {receta.link && (
                      <div className="recipe-actions">
                        <a href={receta.link} target="_blank" rel="noopener noreferrer" className="recipe-link">📖 Ver Receta Completa</a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>Desarrollado con AWS Serverless • Chefcito</p>
      </footer>
    </div>
  );
}

export default App;