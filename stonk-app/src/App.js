import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}
// Kartik: Sample API call
let apiFile = require("./env.json");
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

export default App;
