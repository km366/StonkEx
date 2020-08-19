import React from "react";
import { Navbar,Nav,Button } from 'react-bootstrap';
import app from './firebase';

class NavBar extends React.Component {
  constructor(){
    super();
    this.state = {
      money: 0
    }
  }
  getBalance = async() => {
    let email = app.auth().currentUser.email;
    app.firestore().collection("leaderboard").doc(email)
      .onSnapshot((doc) => {
        let userMoney = doc.data().money;
        this.setState({money: userMoney});
      });
  }
  render() {
    const { money } = this.state;
    return(
      <div>
        <Navbar bg="light" expand="lg">
          <Navbar.Brand href="#home">Stonk-Ex</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link href="/home">Home</Nav.Link>
              <Nav.Link href="/leaderboard">Leaderboard</Nav.Link>
            </Nav>
            <Nav.Item style={{margin: "5px", color: "#00b300"}}>Account Balance: ${money.toLocaleString(undefined, {maximumFractionDigits:2})} </Nav.Item>
            <Button variant="outline-success" onClick={() => app.auth().signOut()}>Sign Out</Button>
          </Navbar.Collapse>
        </Navbar>
      </div>
    )
  }
  componentDidMount(){
    this.getBalance();
  }
}

export default NavBar;