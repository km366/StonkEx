import React, { useCallback } from "react";
import app from "../Utilities/firebase";
import NavBar from "../Utilities/navbar";
import Loader from 'react-loader-spinner';
import { Table } from "react-bootstrap";

class LeaderBoard extends React.Component {
    constructor(){
        super();
        this.state = {
            loading: true,
            lbData: [],
            currentUser: ""
        }
    }
    async makeAPICall(stonk){
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
            price: snapshot.val().latestPrice,
            change: snapshot.val().change,
            changepercent: snapshot.val().changePercent,
            ticker: stonk
        }
        info[`${snapshot.val().company}`] = value
    })}
    return info
    }
    async updateData(){
        await app.firestore().collection("leaderboard").get()
        .then((querySnap) => {
            querySnap.forEach(async (doc) => {
                let email = doc.id;
                let stonks = doc.data().stocks;
                let info = await this.getStonks(doc.data().stocks);
                let portfolioVal = 0;
                for (let values in info) {
                portfolioVal += (info[values].price) * (stonks[info[values].ticker])
                }
                app.firestore().collection("leaderboard").doc(email).update({
                    portfolio: parseFloat(portfolioVal.toFixed(2))
                });
            });
        });
    }
    getData = async() => {
        await this.updateData();
        let email = app.auth().currentUser.email;
        this.setState({currentUser: email});
        await app.firestore().collection("leaderboard")
          .onSnapshot((querySnap) => {
              let data = [];
              let m = [];
            querySnap.forEach((doc) => {
                  let d = doc.data();
                  d.email = doc.id
                  data.push(d);
                  m.push(parseFloat(doc.data().money+doc.data().portfolio).toFixed(2));
            });
            console.log(data);
            let temp = data.sort(function(a, b) {
                return (b.money + b.portfolio) - (a.money + a.portfolio)
            });
            let currentRank = 1;
            let counter = 1;
            let currentSum = temp[0].money + temp[0].portfolio;
            temp[0].rank = currentRank;
            while (counter < temp.length){
              if (currentSum === (temp[counter].money + temp[counter].portfolio)) {
                  temp[counter].rank = currentRank;
              }
              else{
                  temp[counter].rank = counter+1;
                  currentSum = temp[counter].money + temp[counter].portfolio;
                  currentRank++;
              }
              counter++;
            }
            this.setState({lbData: temp, loading: false});
          });

    }
    render() {
        const { lbData, loading, currentUser } = this.state;
        if (loading){
            return(
                <div className="leaderboard">
                    <NavBar />
                    <h1>Leaderboard</h1>
                    <Loader type="Circles" color="#2BAD60" height="50" width="50" />
                </div>
            )
        }
        else{
            return(
                <div className="leaderboard">
                    <NavBar />
                    <h1>Leaderboard</h1>
                    <Table>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Name</th>
                                <th>Current Account Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lbData.map((data, key) => {
                                if(currentUser == data.email) {
                                    return(
                                        <tr style={{backgroundColor: "#fed8b1"}}>
                                            <td>{data.rank}</td>
                                            <td>{data.name}</td>
                                            <td>{(data.money + data.portfolio).toFixed(2)}</td>
                                        </tr>
                                    )
                                }
                                return(
                                    <tr>
                                        <td>{data.rank}</td>
                                        <td>{data.name}</td>
                                        <td>{(data.money + data.portfolio).toFixed(2)}</td>
                                    </tr>
                                )
                            })
                            }
                        </tbody>
                    </Table>
                </div>
                
            )
        }
    }
    componentDidMount(){
      this.getData();
    }
}

export default LeaderBoard;