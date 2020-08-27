import React from "react";
import NavBar from "../Utilities/navbar";
import Loader from 'react-loader-spinner';
import { Card } from "react-bootstrap";
import app from "../Utilities/firebase";

class Search extends React.Component {
    constructor(){
        super();
        this.state = {
            loading: false,
            sData: {}
        };
    }
    buyStock = async(event) => {
        event.preventDefault();
        let { number } = event.target.elements;
        if (number.value === ''){
            alert("Please enter number of stocks you wish to buy.");
            return;
        }
        let email = app.auth().currentUser.email;
        let db = app.firestore().collection("leaderboard")
        db.doc(email).get()
        .then((doc) => {
            let currentFunds = doc.data().money;
            app.database().ref('/stocks/'+number.id).once('value').then((snap) => {
                let totalAmt = snap.val().latestPrice * parseInt(number.value);
                if(totalAmt > currentFunds){
                    alert("Insufficient funds!");
                    return;
                }
                else{
                    let newFunds = (currentFunds - (snap.val().latestPrice * parseInt(number.value))).toFixed(2);
                    newFunds = parseFloat(newFunds);
                    let newInvested = parseFloat((doc.data().invested + snap.val().latestPrice * parseInt(number.value)).toFixed(2));
                    let newPortfolio = parseFloat((doc.data().portfolio + snap.val().latestPrice * parseInt(number.value)).toFixed(2));
                    if (doc.data().stocks === undefined){
                        let temp = {};
                        temp[number.id] = number.value;
                        db.doc(email).update({
                            money: newFunds,
                            stocks: temp,
                            invested: newInvested,
                            portfolio: newPortfolio
                        });
                    }
                    else {
                        let currentStockArray = doc.data().stocks;
                        if(doc.data().stocks[number.id] === undefined){
                            currentStockArray[number.id] = number.value;
                            db.doc(email).update({
                                money: newFunds,
                                stocks: currentStockArray,
                                invested: newInvested,
                                portfolio: newPortfolio
                            });
                        }
                        else{
                            let num = parseInt(doc.data().stocks[number.id]);
                            currentStockArray[number.id] = num + parseInt(number.value);
                            db.doc(email).update({
                                money: newFunds,
                                stocks: currentStockArray,
                                invested: newInvested,
                                portfolio: newPortfolio
                            });
                        }
                    }
                    alert("Successfully bought stocks!");
                    let div = document.getElementById('cards');
                    while(div.lastChild){
                        div.removeChild(div.lastChild);
                    }
                }
            });

        });
    }
    async makeAPICall(stockData) {
        let apiFile = require("../Utilities/env.json");
        let randomInt = Math.floor(Math.random() * 5);
        let apiKey = apiFile["api_key"][randomInt];
        let baseUrl = apiFile["base_api_url"];
        fetch(`${baseUrl}stable/stock/market/batch?symbols=${stockData.key.replace('_P', '.').replace('_D', '$')}&types=quote&token=${apiKey}`, {
            "method": "GET"
        })
        .then(response => {
            return response.json();
        })
        .then(async (data) => {
            let tempData = new Object;
            tempData.company = data[stockData.key].quote.companyName;
            tempData.change = data[stockData.key].quote.change;
            tempData.changePercent = (parseFloat(data[stockData.key].quote.changePercent).toFixed(3)).toString();
            tempData.latestPrice = data[stockData.key].quote.latestPrice;
            if (data[stockData.key].quote.iexLastUpdated == -1 || data[stockData.key].quote.iexLastUpdated == 0){
                tempData.latestTime = new Date(data[stockData.key].quote.latestTime);
            }
            else {
                tempData.latestTime = new Date(data[stockData.key].quote.iexLastUpdated)
            }
            await app.database().ref(`/stocks/`+stockData.key).set(tempData);
        })
        .catch(err => {
            console.log(err);
        });
    }
    async getStockData(names) {
        let data = {};
        for(let stock of names){
            await app.database().ref(`/stocks/${stock}`).once('value')
                .then((snapshot) => {
                data[stock] = snapshot.val();
            })
        }
        setTimeout(() => {
            this.setState({loading: false, sData: data});
        }, 100)
    }
    async getStockNames(stock) {
        let names = [];
        let startAlphabet = String.fromCharCode(stock.value.toUpperCase().charCodeAt(0));
        let endAlphabet = String.fromCharCode(stock.value.toUpperCase().charCodeAt(0) + 1);
        await app.database().ref('/stocks').orderByKey().startAt(`${startAlphabet}`).endAt(`${endAlphabet}`).once('value').then((snap)=>{
            let counter = 0;
            let stockName = stock.value;
            //Firebase keys have been encoded becuse firebase does not accept special characters like . and $ in the name of the key
            stockName = stockName.replace('.', '_P').replace('$', '_D');
            let totalChildren = snap.numChildren();
            let childCounter = 1;
            snap.forEach((stockData) => {
                let patt = new RegExp(`^${stockName.toUpperCase()}`);
                if (counter < 5) {
                    if ((patt.test(stockData.key)) || patt.test(stockData.child('company').val().toUpperCase())){
                        names.push(stockData.key);
                        let currentDate = new Date();
                        let stockDate;
                        if (stockData.child('latestTime').val() === null){
                            stockDate = new Date();
                        } else {
                            stockDate = new Date(stockData.child('latestTime').val());
                        }
                        if(stockData.child('latestPrice').val() === null || Math.ceil((currentDate - stockDate)/(1000 * 60 * 60 * 24)) > 1){
                            this.makeAPICall(stockData);
                        }
                        counter++;
                    }
                }
                if (counter === 5 || childCounter >= totalChildren){
                    return true;
                }
                childCounter++;
            });
          });
        return names;
    }
    handleSearch = async(event) => {
        event.preventDefault();
        this.setState({loading: true});
        const { stock } = event.target.elements;
        let stockNames = await this.getStockNames(stock);
        await this.getStockData(stockNames);
    }
    render() {
        const { loading, sData } = this.state;
        if (loading) {
            return(
                <div className="search">
                    <NavBar />
                    <h1>Search for Stocks</h1>
                    <form onSubmit={this.handleSearch}>
                        <div className="form-group">
                            <label>Stock Name</label>
                            <input type="text" name="stock" className="form-control" placeholder="Enter stock to buy" />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block">Search</button>
                    </form>
                    <p>Don't see the stock you're looking for?</p>
                    <p>Try a more detailed search!</p>
                    <Loader type="Circles" color="#2BAD60" height="50" width="50" />
                </div>
            )
        }
        return (
            <div style={{position: 'relative'}}>
                <NavBar />
                <h1>Search for Stocks</h1>
                <form onSubmit={this.handleSearch}>
                    <div className="form-group">
                        <label>Stock Name</label>
                        <input type="text" name="stock" className="form-control" placeholder="Enter stock to buy" />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block">Search</button>
                </form>
                <div id="stocks">
                </div>
                <div id="cards">
                    {Object.keys(sData).map((data, key) => {
                        return(
                            <Card className="text-center" style={{margin: "10px"}}>
                                <Card.Body>
                                    <Card.Title>{data}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">Comapany: {sData[data].company}</Card.Subtitle>
                                    <Card.Text>Current price: <b>${sData[data].latestPrice}</b></Card.Text>
                                    {sData[data].change > 0 ? (
                                        <div>
                                            <Card.Text style={{color: 'green'}}>Daily Change is ${sData[data].change}</Card.Text>
                                            <Card.Text style={{color: 'green'}}>Percentage Change is {sData[data].changePercent}%</Card.Text>
                                        </div>
                                    ) : (
                                        <div>
                                            <Card.Text style={{color: 'red'}}>Daily Change is ${sData[data].change}</Card.Text>
                                            <Card.Text style={{color: 'red'}}>Percentage Change is {sData[data].changePercent}%</Card.Text>
                                        </div>
                                    )}
                                    <p className="mb-2 text-muted" style={{fontSize: '12px'}}>Note: Values are not in realtime due to API restrictions.</p>
                                    <form onSubmit={this.buyStock}>
                                        <input id={data} type='number' name="number" />
                                        <button type='submit'>Buy</button>
                                    </form>
                                </Card.Body>
                            </Card>
                        )
                    })
                    }
                </div>
                <footer style={{
                    position: 'absolute',
                    botton: '0',
                    width: '100%',
                    color: 'grey',
                    textAlign: 'center'
                }}>
                    <p>Don't see the stock you're looking for?</p>
                    <p>Try a more detailed search!</p>
                </footer>
            </div>
        )
    }
}

export default Search;