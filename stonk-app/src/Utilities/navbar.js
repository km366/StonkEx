import React from "react";
import { Navbar,Nav,Button } from 'react-bootstrap';
import app from './firebase';

const NavBar = () => {
  return (
    <>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">Stonk-Ex</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="/home">Home</Nav.Link>
            <Nav.Link href="/leaderboard">Leaderboard</Nav.Link>
          </Nav>
          <Button variant="outline-success" onClick={() => app.auth().signOut()}>Sign Out</Button>
        </Navbar.Collapse>
      </Navbar>
    </>
  );
};

export default NavBar;