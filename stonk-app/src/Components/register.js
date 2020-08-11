import React, { useCallback, useContext } from "react";
import { withRouter, Redirect, NavLink } from "react-router-dom";
import app from "../firebase.js";
import { AuthContext } from "../Auth";

function validateForm(name, pass, confPass){
    if(name.replace(/\s/g, "") === ''){
        return [false, 'Error: Please enter your name.'];
    }
    if(pass !== confPass){
        return [false, 'Error: Passwords do not match.']
    }
    return [true, ''];
}

function addToDB(userEmail, userName){
    let db = app.firestore();
    db.collection("users").add({
        email: userEmail,
        name: userName
    })
    .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
}

const Register = ({ history }) => {
  const handleRegister = useCallback(
    async event => {
      event.preventDefault();
      const { name, email, password, confPassword } = event.target.elements;
      const validateInfo = validateForm(name.value, password.value, confPassword.value);
      if (!validateInfo[0]){
        alert(validateInfo[1]);
        return;
      }
      try {
        await app
          .auth()
          .createUserWithEmailAndPassword(email.value, password.value).then(
            () => {
              const user = app.auth().currentUser;
              user.sendEmailVerification().then(
                  () => {
                    console.log("Verification email sent!");
                  },
                  (err) => {
                    console.log(err);
                    return;
                  });
            });
          history.push("/login");
          addToDB(email.value, name.value);
      } catch (error) {
        alert(error);
      }
    },
    [history]
  );

  return (
    <div>
        <h2>Registration</h2>
        <form onSubmit={handleRegister}>
            <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" className="form-control" placeholder="Enter name" />
            </div>

            <div className="form-group">
                <label>Email address</label>
                <input type="email" name="email" className="form-control" placeholder="Enter email" />
            </div>

            <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" className="form-control" placeholder="Enter password" />
            </div>

            <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" name="confPassword" className="form-control" placeholder="Enter password" />
            </div>

            <button type="submit" className="btn btn-primary btn-block">Register</button>
        </form>
        <h5>Have an Account?</h5>
        <NavLink to="/login">Login Here</NavLink>
    </div>
  );
};

export default withRouter(Register);