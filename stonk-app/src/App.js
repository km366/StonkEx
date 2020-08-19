import React from 'react';
import Routes from './Utilities/routes';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './App.css';


function App() {
  return (
    <div className="App">
      <h1 className="app-header">
        Stonk-Ex
      </h1>
      <Routes />
    </div>
  );
}

// Kartik: Sample API call
function sampleAPICall(){
  let apiFile = require("./Utilities/env.json");
  let apiKey = apiFile["api_key"];
  let baseUrl = apiFile["base_api_url"];

  fetch(`${baseUrl}function=GLOBAL_QUOTE&symbol=TSLA&apikey=${apiKey}`, {
    "method": "GET"
  })
  .then(response => {
    return response.json();
  })
  .then(data => {
    console.log(data);
  })
  .catch(err => {
    console.log(err);
  });
}

export default App;
