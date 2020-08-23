import React, { useCallback } from "react";
import { withRouter, NavLink } from "react-router-dom";
import app from "../Utilities/firebase.js";

function validateForm(firstname, lastname, pass, confPass){
    if(firstname.replace(/\s/g, "") === ''){
      return [false, 'Error: Please enter your first name.'];
    }
    if(lastname.replace(/\s/g, "") === ''){
        return [false, 'Error: Please enter your last name.'];
    }
    if(pass !== confPass){
        return [false, 'Error: Passwords do not match.']
    }
    return [true, ''];
}

function addToDB(userEmail, userFirstName, userLastName){
    let db = app.firestore();
    db.collection("users").doc(userEmail).set({
        fname: userFirstName,
        lname: userLastName
    })
    .then(function(docRef) {
        console.log("Document written with ID: ", userEmail);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
    db.collection("leaderboard").doc(userEmail).set({
        name: userFirstName,
        money: 100000,
        invested: 0,
        portfolio: 0
    })
    .then(() => {console.log("Data written!")})
    .catch((err) => {console.log("Error:", err)});
}

const Register = ({ history }) => {
  const handleRegister = useCallback(
    async event => {
      event.preventDefault();
      const { firstname, lastname, email, password, confPassword } = event.target.elements;
      const validateInfo = validateForm(firstname.value, lastname.value, password.value, confPassword.value);
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
          addToDB(email.value, firstname.value, lastname.value);
          history.push("/login");
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
                <label>First Name</label>
                <input type="text" name="firstname" className="form-control" placeholder="Enter First Name" />
            </div>

            <div className="form-group">
                <label>Last Name</label>
                <input type="text" name="lastname" className="form-control" placeholder="Enter Last Name" />
            </div>

            <div className="form-group">
                <label>Email address</label>
                <input type="email" name="email" className="form-control" placeholder="Enter Email" />
            </div>

            <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" className="form-control" placeholder="Enter Password" />
            </div>

            <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" name="confPassword" className="form-control" placeholder="Confirm Password" />
            </div>

            <button type="submit" className="btn btn-primary btn-block">Register</button>
        </form>
        <h5>Have an Account?</h5>
        <NavLink to="/login">Login Here</NavLink>
    </div>
  );
};

export default withRouter(Register);