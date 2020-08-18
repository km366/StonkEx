import React from 'react';
import { BrowserRouter as Router, Route, Switch, withRouter } from 'react-router-dom';
import PrivateRoute from './privateRoute';
import Login from './Components/login';
import Register from './Components/register';
import Home from './Components/home';
import Leaderboard from './Components/leaderboard';
import { AuthProvider } from "./Auth";

const Routes = withRouter(({ location }) => {
  return (
    <AuthProvider>
        <Router>
          <div>
            <Switch>
                <PrivateRoute exact path="/" component={Home} />
                <PrivateRoute exact path="/home" component={Home}/>
                <PrivateRoute exact path="/leaderboard" component={Leaderboard} />
                <Route exact path="/login" component={Login} />
                <Route exact path="/register" component={Register}/>
            </Switch>
          </div> 
        </Router>
      </AuthProvider> 
  );
});
   
export default Routes;