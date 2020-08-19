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
      testData: {
        stonk1: {
          price: 100,
          change: -4,
          changepercent: -13.2,
        },
        stonk2: {
          price: 150,
          change: 3,
          changepercent: 2,
        },
        stonk3: {
          price: 120,
          change: 2,
          changepercent: 1.2,
        },
        stonk4: {
          price: 10,
          change: -1,
          changepercent: -7,
        },
        stonk5: {
          price: 100,
          change: 4,
          changepercent: 13.2,
        },
        stonk6: {
          price: 150,
          change: 3,
          changepercent: 2,
        },
        stonk7: {
          price: 100,
          change: -4,
          changepercent: -13.2,
        },
        stonk8: {
          price: 150,
          change: 3,
          changepercent: 2,
        }
      }
    }
  }
  getUser = async() => {
    let email = app.auth().currentUser.email;
    await app.firestore().collection("users").doc(email)
      .onSnapshot((doc) => {
          let userFirstName = doc.data().fname;
          this.setState({name: userFirstName, loading: false});
          console.log(this.state.name);
      });
  }
  render() {
    const { loading, name, testData } = this.state;
    if (loading) {
      return (
        <div className="portfolio">
          <NavBar />
          <h2>Portfolio</h2>
          <Loader type="Circles" color="#2BAD60" height="50" width="50" />
        </div>
      )
    }
    else {
      return (
        <div className="portfolio">
          <NavBar />
          <h2>Welcome, {name}!</h2>
          <h4>Your Current Portfolio:</h4>
          {Object.keys(testData).map((data, index) => {
            console.log(testData[data].dailyChange)
          return (
            <Card className="text-center">
              <Card.Body>
                <Card.Title>{data}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">Current Price: ${testData[data].price}</Card.Subtitle>
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
              </Card.Body>
            </Card>
              );
            })}
        </div>
      )
    }
  }
  componentDidMount(){
    this.getUser();
  }
}

export default Home;