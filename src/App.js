import React, { useState } from 'react';
import './App.css';

const API_URL_RECOMMEND = "https://l52y944285.execute-api.us-east-2.amazonaws.com/recommend";
const API_URL_GET_BY_ID = "https://l52y944285.execute-api.us-east-2.amazonaws.com/recipes";

function App() {
  
  const [tiempo, setTiempo] = useState(3);
  const [dificultad, setDificultad] = useState(3);
  const [costo, setCosto] = useState(3);

  const [resultados, setResultados] = useState([]);
  const [mensaje, setMensaje] = useState("Mueve los sliders para encontrar tu próxima comida.");

  const buscarRecomendaciones = () => {
    setMensaje("Buscando en la cocina de Remy...");
    setResultados([]);

    const url = `${API_URL_RECOMMEND}?tiempo=${tiempo}&dificultad=${dificultad}&costo=${costo}`;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setMensaje(`Error de la API: ${data.error}`);
        } else {
          setResultados(data);
          setMensaje(`¡Encontramos ${data.length} opciones para ti!`);
        }
      })
      .catch(err => {
        console.error("Error al llamar a la API:", err);
        setMensaje("Error de conexión. ¿Está la API desplegada?");
      });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🐭 Chefcito</h1>
        <p>Asistente de recetas</p>
      </header>
      
      <div className="Controles">
        
        <div className="Slider">
          <div className="SliderLabel">
            <span className="LabelTitle">Tiempo</span>
            <span className="LabelDescription">(1=Rápido, 5=Lento)</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="5" 
            value={tiempo} 
            onChange={(e) => setTiempo(e.target.value)} 
          />
          <span>{tiempo}</span>
        </div>

        <div className="Slider">
          <div className="SliderLabel">
            <span className="LabelTitle">Dificultad</span>
            <span className="LabelDescription">(1=Fácil, 5=Experto)</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="5" 
            value={dificultad} 
            onChange={(e) => setDificultad(e.target.value)} 
          />
          <span>{dificultad}</span>
        </div>

        <div className="Slider">
          <div className="SliderLabel">
            <span className="LabelTitle">Costo</span>
            <span className="LabelDescription">(1=Económico, 5=Gourmet)</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="5" 
            value={costo} 
            onChange={(e) => setCosto(e.target.value)} 
          />
          <span>{costo}</span>
        </div>

        <button className="BotonBuscar" onClick={buscarRecomendaciones}>
          ¡Encontrar recetas!
        </button>
      </div>
      
      <div className="Resultados">
        <h3>{mensaje}</h3>
        {resultados.map((receta) => (
          <div className="TarjetaReceta" key={receta.recipe_id}>
            <h4>{receta.nombre}</h4>
            <p><strong>Ingredientes:</strong> {receta.ingredientes}</p>
            <a href={receta.link} target="_blank" rel="noopener noreferrer">
              Ver Receta
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;