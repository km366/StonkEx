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
function sampleAPICall(stocks){
  let apiFile = require("./Utilities/env.json");
  let randomInt = Math.floor(Math.random() * 5);
  let apiKey = apiFile["api_key"][randomInt];
  let baseUrl = apiFile["base_api_url"];

  fetch(`${baseUrl}stable/stock/market/batch?symbols=${stocks}&types=quote&token=${apiKey}`, {
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
//console.log(sampleAPICall(['aapl', 'tsla']));
export default App;
