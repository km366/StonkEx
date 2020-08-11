import React from "react";
import app from "../firebase";

const Home = () => {
  return (
    <>
      <h3>Dashboard</h3>
      <button onClick={() => app.auth().signOut()}>Sign out</button>
    </>
  );
};

export default Home;