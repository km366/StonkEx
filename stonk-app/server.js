const axios = require("axios");
const express = require("express");
const cors = require("cors");
const apiFile = require("./search_env.json");
const { response, json } = require("express");
const admin = require('firebase-admin');

let app = express();

app.use(express.json())
app.use(cors());

//API URL's and keys
let alphaApiKey = apiFile["alpha_api_key"];
let alphaBaseUrl = apiFile["alpha_base_api_url"];
let iexCaseUrl = apiFile["iex_base_api_url"];

//Firebase admin
const serviceAccount = require("./firebase-admin-sdk.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://stonkex-37533.firebaseio.com"
});

//Firestore
const db = admin.firestore();

//Local hosting information
let port = 9000;
let hostname = "localhost";

app.get('/home', (req, res) => {
    let randomInt = Math.floor(Math.random() * apiFile["iex_api_key"].length);
    let iexApiKey = apiFile["iex_api_key"][randomInt];
    let email = req.query.email;
    let jsonData = {}
    db.collection("users").doc(email)
    .onSnapshot((doc) => {
        let userFirstName = doc.data().fname;
        jsonData.name = userFirstName;
        db.collection("leaderboard").doc(email).get()
        .then(async(doc) => {
        let userMoney = doc.data().money;
        jsonData.money = userMoney;
        jsonData.invested = doc.data().invested;
        let stonks = doc.data().stocks;
        let portfolioVal = 0;
        await axios.get(`${iexCaseUrl}stable/stock/market/batch?symbols=${Object.keys(stonks)}&types=quote&token=${iexApiKey}`)
        .then((response) => {
            jsonData.stocks = response.data;
            for (let val in response.data){
                jsonData.stocks[val]['quantity'] = Number(stonks[val]);
                portfolioVal += parseInt(stonks[val]) * parseFloat(response.data[val].quote.latestPrice);
            }
        })
        .catch((err) => {
            console.log(err);
        })
        db.collection("leaderboard").doc(email).update({
            portfolio: Number((portfolioVal).toFixed(2))
        });
        jsonData.portfolio = Number((portfolioVal).toFixed(2));
        res.status(200);
        res.json(jsonData);
        });
    });
})

app.get('/search', (req, res) => {
    let term = req.query.term;
    let randomInt = Math.floor(Math.random() * apiFile["iex_api_key"].length);
    let iexApiKey = apiFile["iex_api_key"][randomInt];
    let jsonData = {}
    axios.get(`${alphaBaseUrl}function=SYMBOL_SEARCH&keywords=${term}&apikey=${alphaApiKey}`)
    .then((response) => {
        res.status(200);
        if(response.data.bestMatches.length === 0){
            jsonData.message = "No results";
            res.json(jsonData);
        }
        else {
            stockArr = [];
            for (let stock of response.data.bestMatches){
                stockArr.push(stock['1. symbol']);
            }
            axios.get(`${iexCaseUrl}stable/stock/market/batch?symbols=${stockArr}&types=quote&token=${iexApiKey}`)
            .then((resp) => {
                jsonData.message = "Found results";
                jsonData.data = resp.data;
                res.json(jsonData);
            })

        }
        console.log("Sent data to client");
    })
    .catch((err) => {
        res.status(400);
        console.log(err);
    })
})

app.post('/buy', (req, res) => {
    let randomInt = Math.floor(Math.random() * apiFile["iex_api_key"].length);
    let iexApiKey = apiFile["iex_api_key"][randomInt];
    let email = req.body['user'];
    if(email === undefined){
        res.status(400);
        res.send("Missing email");
    }
    else{
        let symbol = req.body['symbol'];
        let amount = parseInt(req.body['amount']);
        db.collection("leaderboard").doc(email).get()
        .then((doc) => {
            let currentFunds = doc.data().money;
            axios.get(`${iexCaseUrl}stable/stock/market/batch?symbols=${symbol}&types=quote&token=${iexApiKey}`)
            .then((snap) => {
                let totalAmt = parseFloat(snap.data[symbol].quote.latestPrice) * amount;
                if(amount < 1) {
                    res.status(200);
                    res.send("Invalid input for amount!");
                }
                if(totalAmt > currentFunds){
                    res.status(200);
                    res.send("Insufficient Funds!")
                }
                else{
                    let newFunds = (currentFunds - (snap.data[symbol].quote.latestPrice * parseInt(amount))).toFixed(2);
                    newFunds = parseFloat(newFunds);
                    let newInvested = parseFloat((doc.data().invested + snap.data[symbol].quote.latestPrice * amount).toFixed(2));
                    let newPortfolio = parseFloat((doc.data().portfolio + snap.data[symbol].quote.latestPrice * amount).toFixed(2));
                    if (doc.data().stocks === undefined){
                        let temp = {};
                        temp[symbol] = Number(amount);
                        db.collection("leaderboard").doc(email).update({
                            money: newFunds,
                            stocks: temp,
                            invested: newInvested,
                            portfolio: newPortfolio
                        });
                    }
                    else {
                        let currentStockArray = doc.data().stocks;
                        if(doc.data().stocks[symbol] === undefined){
                            currentStockArray[symbol] = Number(amount);
                            db.collection("leaderboard").doc(email).update({
                                money: newFunds,
                                stocks: currentStockArray,
                                invested: newInvested,
                                portfolio: newPortfolio
                            });
                        }
                        else{
                            let num = Number(doc.data().stocks[symbol]);
                            currentStockArray[symbol] = Number(num + amount);
                            db.collection("leaderboard").doc(email).update({
                                money: newFunds,
                                stocks: currentStockArray,
                                invested: newInvested,
                                portfolio: newPortfolio
                            });
                        }
                    }
                    res.status(200);
                    res.send("Bought stocks!");
                }
            })
            .catch((err) => {
                res.status(400);
                res.send("Error");
            });

        })
        .catch((err) => {
            res.status(400);
            res.send("Error");
        });
    }
})

app.get('/leaderboard', async(req, res) => {
    let jsonData = {};
    await db.collection("leaderboard").get()
    .then((snap) => {
        snap.forEach(async(doc) => {
            let email = doc.id;
            if (doc.data().stocks !== undefined){
                let randomInt = Math.floor(Math.random() * apiFile["iex_api_key"].length);
                let iexApiKey = apiFile["iex_api_key"][randomInt];
                let stonks = doc.data().stocks;
                let portfolioVal = 0;
                await axios.get(`${iexCaseUrl}stable/stock/market/batch?symbols=${Object.keys(stonks)}&types=quote&token=${iexApiKey}`)
                .then((response) => {
                    for (let val in response.data){
                        portfolioVal += parseInt(stonks[val]) * parseFloat(response.data[val].quote.latestPrice);
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
                db.collection("leaderboard").doc(email).update({
                    portfolio: Number((portfolioVal).toFixed(2))
                });
            }
        })
    })
    .catch((err) => {
        jsonData.message = "Error";
        res.status(400);
        res.json(jsonData);
    })
    let lb = [];
    await db.collection("leaderboard").get()
    .then((querySnap) => {
        let data = [];
        let temp = [];
        querySnap.forEach((doc) => {
            let d = doc.data();
            d.email = doc.id
            d.currentSum = Number(parseFloat(doc.data().money+doc.data().portfolio).toFixed(2));
            data.push(d);
        });
        //Script to rank users
        temp = data.sort(function(a, b) {
            return (b.currentSum) - (a.currentSum)
        });
        let currentRank = 1;
        let counter = 1;
        let currentSum = temp[0].currentSum;
        temp[0].rank = currentRank;
        while (counter < temp.length){
            if (currentSum === (temp[counter].currentSum)) {
                temp[counter].rank = currentRank;
            }
            else{
                temp[counter].rank = counter+1;
                currentSum = temp[counter].currentSum;
                currentRank++;
            }
            counter++;
        }
        for (let user of temp){
            let p = {};
            p.name = user.name;
            p.currentSum = user.currentSum;
            p.rank = user.rank;
            lb.push(p);
        }
    })
    .catch((err) => {
        jsonData.message = "Error";
        res.status(400);
        res.json(jsonData);
    })
    jsonData.data = lb;
    jsonData.message = "Success";
    res.status(200);
    res.json(jsonData);
})

app.post('/sell', (req, res) => {
    let randomInt = Math.floor(Math.random() * apiFile["iex_api_key"].length);
    let iexApiKey = apiFile["iex_api_key"][randomInt];
    let email = req.body['user'];
    if(email === undefined){
        res.status(200);
        res.send("Missing email");
    }
    else{
        let symbol = req.body['symbol'];
        let amount = req.body['amount'];
        db.collection("leaderboard").doc(email).get()
        .then((doc) => {
            if(amount < 1) {
                res.status(200);
                res.send("Invalid input for amount!");
            }
            else if(amount > doc.data().stocks[symbol]) {
                res.status(200);
                res.send("Insufficient stocks!");
            }
            else {
                let currentFunds = doc.data().money;
                axios.get(`${iexCaseUrl}stable/stock/market/batch?symbols=${symbol}&types=quote&token=${iexApiKey}`)
                .then((response) => {
                    let totalAmt = response.data[symbol].quote.latestPrice * parseInt(amount);
                    let newFunds = Number((currentFunds + (response.data[symbol].quote.latestPrice * parseInt(amount))).toFixed(2));
                    let newNum = parseInt(doc.data().stocks[symbol]) - parseInt(amount);
                    let newInvested = parseFloat((doc.data().invested - response.data[symbol].quote.latestPrice * parseInt(amount)).toFixed(2));
                    let newPortfolio = parseFloat((doc.data().portfolio - response.data[symbol].quote.latestPrice * parseInt(amount)).toFixed(2));
                    let currentStockArray = doc.data().stocks;
                    if(newNum == 0) {
                        delete currentStockArray[symbol];
                        db.collection("leaderboard").doc(email).update({
                            money: newFunds,
                            stocks: currentStockArray,
                            invested: newInvested,
                            portfolio: newPortfolio
                        });
                        }
                    else {
                    currentStockArray[symbol] = newNum;
                    db.collection("leaderboard").doc(email).update({
                        money: newFunds,
                        stocks: currentStockArray,
                        invested: newInvested,
                        portfolio: newPortfolio
                    });
                    }
                    res.status(200);
                    res.send("Success!");
                })
            }
            /*
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
                    db.collection("leaderboard").doc(email).update({
                        money: newFunds,
                        stocks: currentStockArray,
                        invested: newInvested,
                        portfolio: newPortfolio
                    });
                    }
                    else {
                    currentStockArray[number.id] = newNum;
                    db.collection("leaderboard").doc(email).update({
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
            */
        })
    }
})

app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});