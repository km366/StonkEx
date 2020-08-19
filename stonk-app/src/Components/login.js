import React, { useCallback, useContext } from "react";
import { withRouter, Redirect, NavLink } from "react-router-dom";
import app from "../Utilities/firebase.js";
import { AuthContext } from "../Utilities/Auth";

const Login = ({ history }) => {
  const handleLogin = useCallback(
    async event => {
      event.preventDefault();
      const { email, password } = event.target.elements;
      try {
        await app
          .auth()
          .signInWithEmailAndPassword(email.value, password.value).then(
            () => {
              const user = app.auth().currentUser;
              if (user.emailVerified) {
                history.push("/");
              } else {
                alert('Please verify your email first!');
              }
            });
      } catch (error) {
        alert(error);
      }
    },
    [history]
  );

  const { currentUser } = useContext(AuthContext);

  if (currentUser && currentUser.emailVerified) {
    return <Redirect to="/" />;
  }

  return (
    <div>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
            <div className="form-group">
                <label>Email address</label>
                <input type="email" name="email" className="form-control" placeholder="Enter email" />
            </div>

            <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" className="form-control" placeholder="Enter password" />
            </div>

            <button type="submit" className="btn btn-primary btn-block">Submit</button>
            <p className="forgot-password text-right">
                Forgot <a href="#">password?</a>
            </p>
        </form>
        <h5>New User?</h5>
        <NavLink to="/register">Register Here</NavLink>
    </div>
  );
};

export default withRouter(Login);