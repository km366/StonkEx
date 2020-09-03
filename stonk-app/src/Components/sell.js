import React from "react";
import NavBar from "../Utilities/navbar";
import Loader from 'react-loader-spinner';
import { Card } from "react-bootstrap";
import app from "../Utilities/firebase";

class Sell extends React.Component {
  constructor(){
    super();
    this.state= {
      loading: true,
      name: '',
      money: 0,
      portfolioValue: 0,
      investedValue: 0,
      testData: {}
    }
  }
  serverCall() {
    let email = app.auth().currentUser.email;
    fetch(`http://localhost:9000/home?email=${email}`)
        .then(res => res.json())
        .then((res) => {
            console.log(res);
            this.setState({name: res.name, money: res.money, portfolioValue: res.portfolio, investedValue: res.invested, testData:res.stocks, loading: false});
        })
  }
  sellStock = async(event) => {
    event.preventDefault();
    let { number } = event.target.elements;
    if (number.value === ''){
        alert("Please enter number of stocks you wish to sell.");
        return;
    }
    let email = app.auth().currentUser.email;
    let user = {
      user: email,
      symbol: number.id,
      amount: number.value
    };
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };
    fetch(`http://localhost:9000/sell`,requestOptions)
      .then(response => response.text())
      .then((data) => {
          let message = data;
          window.location.reload();
          alert(message);
      })
      .catch((error) => {
          alert(error);
      });
}

  render() {
    const { loading, name, testData } = this.state;
    if (loading) {
      return (
        <div className="portfolio">
          <NavBar />
          <Loader type="Circles" color="#2BAD60" height="50" width="50" />
        </div>
      )
    }
    else {
      return (
        <div className="portfolio">
          <NavBar />
          <h2>Welcome, {name}!</h2>
          <h3>Portfolio</h3>
          <h4 style={{color: 'grey'}}>Total Amount Invested: ${this.state.investedValue}</h4>
          <h4 style={{color: 'grey'}}>Total Asset Value: ${this.state.portfolioValue}</h4>
          {Object.keys(testData).map((data, index) => {
          return (
            <Card className="text-center" style={{margin: "10px"}}>
              <Card.Body>
                <Card.Title>{data}</Card.Title>
                <Card.Title>{testData[data].quote.companyName}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">Current Price: ${testData[data].quote.latestPrice}</Card.Subtitle>
                <Card.Subtitle className="mb-2 text-muted">Quantity: {testData[data].quantity}</Card.Subtitle>
                {testData[data].quote.change > 0 ? (
                  <div>
                    <Card.Text style={{color: 'green'}}>Daily Change is ${testData[data].quote.change}</Card.Text>
                    <Card.Text style={{color: 'green'}}>Percentage Change is {testData[data].quote.changePercent}%</Card.Text>
                  </div>
              ) : (
                  <div>
                    <Card.Text style={{color: 'red'}}>Daily Change is ${testData[data].quote.change}</Card.Text>
                    <Card.Text style={{color: 'red'}}>Percentage Change is {testData[data].quote.changePercent}%</Card.Text>
                  </div>
              )}
              <form id={"submit"+{data}} onSubmit={this.sellStock}>
                <input id={testData[data].quote.symbol} type='number' name="number" />
                <button type='submit'>Sell</button>
              </form>
              </Card.Body>
            </Card>
              );
            })}
        </div>
      )
    }
  }
  componentWillMount(){
    this.serverCall();
  }
}

export default Sell;