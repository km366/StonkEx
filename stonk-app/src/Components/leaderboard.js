import React from "react";
import app from "../firebase";
import NavBar from "../navbar";
import { Table } from "react-bootstrap";

const LeaderBoard = () => {
  return (
    <>
      <NavBar />
      <h3>Leaderboard</h3>
      <Table>
          <thead>
              <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Current Account Balance</th>
              </tr>
          </thead>
      </Table>
    </>
  );
};

export default LeaderBoard;