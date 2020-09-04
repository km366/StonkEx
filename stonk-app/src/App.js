import React from 'react';
import Routes from './Utilities/routes';
import { Nav } from 'react-bootstrap';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import logo from './logo.png';


function App() {
  return (
    <div className="App">
      <h1 className="app-header">
        <Nav.Link href='/about'><img src={logo} style={{height:"50%", width:"40%", borderRadius:"10px"}} alt="Stonk-Ex"/></Nav.Link>
      </h1>
      <Routes />
    </div>
  );
}
export default App;
