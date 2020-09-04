import React, { useCallback } from "react";
import app from "../Utilities/firebase";
import AboutNavBar from "../Utilities/aboutNavbar";
//import Loader from 'react-loader-spinner';

class About extends React.Component {

	  
  	render() {
                return(
                <div>
                    <AboutNavBar />
                    <h1 style={{padding: "10px"}}>About</h1>
                    <p style={{padding: "10px"}}>
                       The StonkEx Mock Stock Exchange Platform is a web application that allows you to take part in a mock 
                       stock exchage competition. We hope to replicate a fantasy football feeling where fellow StonkEx users will all start out with the some amount 
                       of money and invest it in stocks of their preference for a particular length of time. You can manage your own stock portfolio 
                       and check on fellow StonkEx users in the leaderboard section. 
                    </p>
                    <h4 style={{padding: "10px"}}>How to Win the Game?</h4>
                    <h5> If you happen to be the user that reports the highest profit or lowest loss, you win that season! </h5>
                    <h3 style={{padding: "5px"}}>Team Members:</h3>
                    <ul style={{textAlign: "center", listStylePosition: "inside", padding: "10px"}}>
                        <li>Akriti Keswani</li>
                        <li>Ankit Trehan</li>
                        <li>Kartik Mohan</li>
                        <li>Sid Verma</li>
                    </ul>
                </div>
            );
	}
	}
        
export default About;
