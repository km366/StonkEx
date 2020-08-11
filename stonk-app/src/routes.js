import React from 'react';
import { BrowserRouter as Router, Route, Switch, withRouter } from 'react-router-dom';
import PrivateRoute from './privateRoute';
import * as firebase from "firebase";
import Login from './Components/login';
import Register from './Components/register';
import Home from './Components/home';
import { AuthProvider } from "./Auth";

class Routes extends React.Component {
    constructor(props){
        super(props);
    }
    render() {
      return ( 
        <AuthProvider>
          <Router>
          <div>
            <Switch>
                <PrivateRoute exact path="/" component={Home} />
                <Route exact path="/login" component={Login} />
                <Route exact path="/register" component={Register}/>
                <PrivateRoute exact path="/home" component={Home}/>
            </Switch>
          </div> 
        </Router>
        </AuthProvider>     
      );
    }
  }
   
export default withRouter(Routes);