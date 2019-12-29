import React from "react";
import "./App.css";
import { HashRouter, Switch, Route, Redirect } from "react-router-dom";
import Standings from "./pages/Standings";
import { Navbar, NavbarBrand } from "reactstrap";
import User from "./pages/User";

const App: React.FC = () => {
  return (
    <>
      <Navbar color="dark" dark>
        <NavbarBrand href="/">AtCoder World Tour [unofficial]</NavbarBrand>
      </Navbar>

      <HashRouter>
        <Switch>
          <Route path="/standings" component={Standings} />
          <Route path="/user/:userId([0-9a-zA-Z\-_]+)" component={User} />
          <Redirect path="/" to="/standings" />
        </Switch>
      </HashRouter>
    </>
  );
};

export default App;
