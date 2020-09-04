import React from "react";
import { Navbar,Nav,Button } from 'react-bootstrap';

const AboutNavBar = ({ history }) => {
    return(
      <div>
        <Navbar bg="light" expand="lg">
          <Navbar.Brand href="#about">Stonk-Ex</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
              <Nav.Link href="/register">Register</Nav.Link>
              <Nav.Link href="/login">Log-in</Nav.Link>
          </Navbar.Collapse>
        </Navbar>
      </div>
    )
}

export default AboutNavBar;