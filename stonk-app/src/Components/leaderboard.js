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
    async serverCall(){
        let email = app.auth().currentUser.email;
        fetch('http://localhost:9000/leaderboard')
        .then(res => res.json())
        .then((res) => {
            if(res.message === "Success"){
                this.setState({lbData: res.data, loading: false, currentUser: email})
            }
            else{
                this.setState({loading: false});
                alert(res.message);
            }
        })
        .catch((err) => {
            console.log(err);
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
                                            <td>{(data.currentSum).toFixed(2)}</td>
                                        </tr>
                                    )
                                }
                                return(
                                    <tr>
                                        <td>{data.rank}</td>
                                        <td>{data.name}</td>
                                        <td>{(data.currentSum).toFixed(2)}</td>
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
    componentWillMount(){
        this.serverCall();
    }
}

export default LeaderBoard;