import React from "react";
import NavBar from "../Utilities/navbar";
import Loader from 'react-loader-spinner';
import { Card } from "react-bootstrap";
import app from "../Utilities/firebase";

class Home extends React.Component {
  constructor(){
    super();
    this.state= {
      loading: true,
      name: '',
      money: 0,
      portfolioValue: 0,
      investedValue: 0,
      stockData: {}
    }
  }
  async serverCall(){
    let id = "";
    await app.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
      id = idToken;
    })
    .catch((err) => {
      this.setState({loading: false});
      alert("Error");
    })
    if (id === ""){
      this.setState({loading: false});
      alert("Failed to load page!");
    }
    else{
      await fetch(`https://shielded-caverns-36784.herokuapp.com/home?token=${id}`)
      .then(res => res.json())
      .then((res) => {
          this.setState({name: res.name, money: res.money, portfolioValue: res.portfolio, investedValue: res.invested, stockData:res.stocks, loading: false});
      })
    }
  }
  render() {
    const { loading, name, stockData } = this.state;
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
          {Object.keys(stockData).map((data, index) => {
          return (
            <Card className="text-center" style={{margin: "10px"}}>
              <Card.Body>
                <Card.Title>{stockData[data].quote.symbol}</Card.Title>
                <Card.Subtitle className="mb-2">{stockData[data].quote.companyName}</Card.Subtitle>
                <Card.Subtitle className="mb-2 text-muted">Current Price: ${stockData[data].quote.latestPrice}</Card.Subtitle>
                {stockData[data].quote.change > 0 ? (
                  <div>
                    <Card.Text style={{color: 'green'}}>Daily Change is ${stockData[data].quote.change}</Card.Text>
                    <Card.Text style={{color: 'green'}}>Percentage Change is {stockData[data].quote.changePercent}%</Card.Text>
                  </div>
              ) : (
                  <div>
                    <Card.Text style={{color: 'red'}}>Daily Change is ${stockData[data].quote.change}</Card.Text>
                    <Card.Text style={{color: 'red'}}>Percentage Change is {stockData[data].quote.changePercent}%</Card.Text>
                  </div>
              )}
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

export default Home;