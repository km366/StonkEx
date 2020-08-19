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
            money: [],
            ranks: []
        }
    }
    getData = async() => {
        await app.firestore().collection("leaderboard").orderBy("money", "desc")
          .onSnapshot((querySnap) => {
              let data = [];
              let m = [];
              querySnap.forEach((doc) => {
                  data.push(doc.data());
                  m.push(doc.data().money);
              });
              this.setState({lbData: data, loading: false, money: m});
              //https://stackoverflow.com/questions/14834571/ranking-array-elements
              let tempSorted = this.state.money.slice().sort(function(a,b){return b-a});
              let tempRanks = this.state.money.map(function(v){ return tempSorted.indexOf(v)+1 });
              this.setState ({ranks: tempRanks});
          });
    }
    render() {
        const { lbData, loading, ranks } = this.state;
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
                                return(
                                    <tr>
                                        <td>{ranks[key]}</td>
                                        <td>{data.name}</td>
                                        <td>{data.money}</td>
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