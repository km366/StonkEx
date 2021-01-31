import React, { useCallback } from "react";
import app from "../Utilities/firebase";
import Navbar from "../Utilities/navbar";
import AboutNavBar from "../Utilities/aboutNavbar";
//import Loader from 'react-loader-spinner';

class About extends React.Component {
    constructor(){
        super();
        this.state = {isLoggedIn: false};
    }
	getNavbar() {
        let currentUser = "";
        currentUser = app.auth().currentUser;
        if (currentUser !== null) {
            this.setState({isLoggedIn: true})
        }
    }  
  	render() {
          let navbar =  <AboutNavBar />;
          let isLoggedIn = this.state.isLoggedIn;
          if(isLoggedIn){
              navbar = <Navbar />;
          }
                return(
                <div>
                    {navbar}
                    <h1 style={{padding: "10px"}}>About</h1>
                    <h5 style={{padding: "10px"}}>
                       The StonkEx Mock Stock Exchange Platform is a web application that allows you to take part in a mock 
                       stock exchage competition. We hope to replicate a fantasy football feeling where fellow StonkEx users will all start out with the some amount 
                       of money and invest it in stocks of their preference for a particular length of time. You can manage your own stock portfolio 
                       and check on fellow StonkEx users in the leaderboard section. 
                    </h5>
                    <h4 style={{padding: "10px"}}>How to Win the Game?</h4>
                    <h5> If you happen to be the user that reports the highest profit or least loss, you're declared the winner for that season! </h5>
                </div>
            );
    }
    componentWillMount(){
        this.getNavbar();
      }
}
        
export default About;
