const express = require("express");
const app = express();
const api_key = "apiprotegida";


const verificarAPIKey = (req, res, next) => {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey || apiKey !== api_key) {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    next();
  };

app.get("/get-filters", verificarAPIKey, ( req ,res) => {
  const info = {
    nonbre : "marcos",
    apellido : "montes",
    direccion : {
        calle : 129,
        barrio : "AURES2"
    },
    localidad : "Suba"
}

const result = info.direccion.barrio;

  res.json(result); // Enviar los filtros como JSON
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});