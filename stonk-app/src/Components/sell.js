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
  sellStock = async(event) => {
    event.preventDefault();
    let { number } = event.target.elements;
    let stock = number.id;
    if (number.value === ''){
        alert("Please enter number of stocks you wish to sell.");
        return;
    }
    let email = app.auth().currentUser.email;
    let db = app.firestore().collection("leaderboard")
    db.doc(email).get()
    .then((doc) => {
        if(this.state.testData[number.id].number < number.value) {
          alert("Insufficient stocks!");
        }
        else{
          let currentFunds = doc.data().money;
          app.database().ref('/stocks/'+number.id).once('value').then((snap) => {
              let totalAmt = snap.val().latestPrice * parseInt(number.value);
                let newFunds = (currentFunds + (snap.val().latestPrice * parseInt(number.value))).toFixed(2);
                let newNum = parseInt(doc.data().stocks[number.id]) - parseInt(number.value);
                newFunds = parseFloat(newFunds);
                let newInvested = parseFloat((doc.data().invested - snap.val().latestPrice * parseInt(number.value)).toFixed(2));
                let newPortfolio = parseFloat((doc.data().portfolio - snap.val().latestPrice * parseInt(number.value)).toFixed(2));
                let currentStockArray = doc.data().stocks;
                if(newNum == 0) {
                  delete currentStockArray[number.id];
                  db.doc(email).update({
                    money: newFunds,
                    stocks: currentStockArray,
                    invested: newInvested,
                    portfolio: newPortfolio
                  });
                }
                else {
                  currentStockArray[number.id] = newNum;
                  db.doc(email).update({
                    money: newFunds,
                    stocks: currentStockArray,
                    invested: newInvested,
                    portfolio: newPortfolio
                  });
                }
                let inputID = number.id;
                console.log(inputID);
                console.log(document.getElementsByTagName('input'));
                document.getElementById(number.id).value = "";
                alert("Successfully sold stocks!");
  
          });
        }


    });
}
  getUser = async() => {
    let email = app.auth().currentUser.email;
    app.firestore().collection("users").doc(email)
      .onSnapshot((doc) => {
          let userFirstName = doc.data().fname;
          this.setState({name: userFirstName});
      });
    app.firestore().collection("leaderboard").doc(email)
      .onSnapshot((doc) => {
        let userMoney = doc.data().money;
        this.setState({money: userMoney});
      });
    app.firestore().collection("leaderboard").doc(email)
      .onSnapshot( async (doc) => {
        let stonks = doc.data().stocks;
        let info = await this.getStonks(stonks);
        let portfolioVal = 0;
        let investVal = doc.data().invested;
        for(let values in info){
          let num = parseInt(stonks[info[values].ticker]);
          info[values].number = num;
          portfolioVal += (info[values].price) * (stonks[info[values].ticker])
        }
        this.setState({portfolioValue: portfolioVal.toFixed(2), investedValue: investVal, loading: false, testData: info});
        app.firestore().collection("leaderboard").doc(email).update({
          portfolio: parseFloat(portfolioVal.toFixed(2))
        });
      });
  }
  makeAPICall(stonk){
    let apiFile = require("../Utilities/env.json");
    let randomInt = Math.floor(Math.random() * 5);
    let apiKey = apiFile["api_key"][randomInt];
    let baseUrl = apiFile["base_api_url"];
    fetch(`${baseUrl}stable/stock/market/batch?symbols=${stonk}&types=quote&token=${apiKey}`, {
      "method": "GET"
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        let tempData = new Object;
        tempData.company = data[stonk].quote.companyName;
        tempData.change = data[stonk].quote.change;
        tempData.changePercent = (parseFloat(data[stonk].quote.changePercent).toFixed(3)).toString();
        tempData.latestPrice = data[stonk].quote.latestPrice;
        tempData.latestTime = data[stonk].quote.latestTime;
        app.database().ref(`/stocks/`+stonk).set(tempData);
    })
    .catch(err => {
        console.log(err);
    });
  }

  async getStonks(stonks){
    let info = {}
    for(let stonk in stonks){
      let stockName = stonk;
      stockName = stockName.replace('.', '_P').replace('$', '_D');
      await app.database().ref(`/stocks/${stockName}`).once('value')
      .then((snapshot) => {
        let stockDate;
        stockDate = new Date(snapshot.child('latestTime').val())
        const currentDate = new Date();
        if(Math.ceil((currentDate - stockDate)/(1000 * 60 * 60 * 24)) > 1){
          this.makeAPICall(stonk);
        }
      })
      await app.database().ref(`/stocks/${stockName}`).once('value')
      .then((snapshot) => {
        let value = {
          company: snapshot.val().company,
          price: snapshot.val().latestPrice,
          change: snapshot.val().change,
          changepercent: snapshot.val().changePercent,
          ticker: stonk
        }
        info[`${stonk}`] = value
    })
    }
    return info
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
                <Card.Title>{testData[data].company}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">Current Price: ${testData[data].price}</Card.Subtitle>
                <Card.Subtitle className="mb-2 text-muted">Quantity: {testData[data].number}</Card.Subtitle>
                {testData[data].change > 0 ? (
                  <div>
                    <Card.Text style={{color: 'green'}}>Daily Change is ${testData[data].change}</Card.Text>
                    <Card.Text style={{color: 'green'}}>Percentage Change is {testData[data].changepercent}%</Card.Text>
                  </div>
              ) : (
                  <div>
                    <Card.Text style={{color: 'red'}}>Daily Change is ${testData[data].change}</Card.Text>
                    <Card.Text style={{color: 'red'}}>Percentage Change is {testData[data].changepercent}%</Card.Text>
                  </div>
              )}
              <form id={"submit"+{data}} onSubmit={this.sellStock}>
                <input id={data} type='number' name="number" />
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
  async componentDidMount(){
    await this.getUser()
  }
}

export default Sell;