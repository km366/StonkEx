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
            sData: {},
            message: ""
        };
    }
    searchCall(term) {
        fetch(`http://localhost:9000/search?term=${term}`)
        .then(res => res.json())
        .then((res) => {
            if(res.message === "No results") {
                this.setState({loading: false, message: res.message});
            }
            else{
                this.setState({loading: false, sData: res.data, message: ""});
            }
        })
    }
    buyStock = async(event) => {
        event.preventDefault();
        let { number } = event.target.elements;
        if (number.value === ''){
            alert("Please enter number of stocks you wish to buy.");
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
        fetch(`http://localhost:9000/buy`,requestOptions)
            .then(response => response.text())
            .then((data) => {
                let message = data;
                alert(message);
            })
            .catch((error) => {
                alert(error);
            });
            let div = document.getElementById('cards');
            while(div.lastChild){
                div.removeChild(div.lastChild);
            }
    }
    handleSearch = async(event) => {
        event.preventDefault();
        this.setState({loading: true});
        const { stock } = event.target.elements;
        this.searchCall(stock.value);
    }
    render() {
        const { loading, sData, serverCall, message } = this.state;
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
                <p>{serverCall}</p>
                <h1>Search for Stocks</h1>
                <form onSubmit={this.handleSearch}>
                    <div className="form-group">
                        <label>Stock Name</label>
                        <input type="text" name="stock" className="form-control" placeholder="Enter stock to buy" />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block">Search</button>
                    <h4>{message}</h4>
                </form>
                <div id="stocks">
                </div>
                <div id="cards">
                    {Object.keys(sData).map((data, key) => {
                        return(
                            <Card className="text-center" style={{margin: "10px"}}>
                                <Card.Body>
                                    <Card.Title>{data}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">Comapany: {sData[data].quote.symbol}</Card.Subtitle>
                                    <Card.Text>Current price: <b>${sData[data].quote.latestPrice}</b></Card.Text>
                                    {sData[data].quote.change > 0 ? (
                                        <div>
                                            <Card.Text style={{color: 'green'}}>Daily Change is ${sData[data].quote.change}</Card.Text>
                                            <Card.Text style={{color: 'green'}}>Percentage Change is {sData[data].quote.changePercent}%</Card.Text>
                                        </div>
                                    ) : (
                                        <div>
                                            <Card.Text style={{color: 'red'}}>Daily Change is ${sData[data].quote.change}</Card.Text>
                                            <Card.Text style={{color: 'red'}}>Percentage Change is {sData[data].quote.changePercent}%</Card.Text>
                                        </div>
                                    )}
                                    <p className="mb-2 text-muted" style={{fontSize: '12px'}}>Note: Values are not in realtime due to API restrictions.</p>
                                    <form onSubmit={this.buyStock}>
                                        <input id={sData[data].quote.symbol} type='number' name="number" />
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