import { Component } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import AuthService from "./services/auth.service";
import User from './model/user';

import Login from "./components/login.component";
import Register from "./components/register.component";
import Home from "./components/home.component";
import Profile from "./components/profile.component";
import Game from "./components/game.component";

import EventBus from "./common/EventBus";
import HighScores from "./components/highscores.component";
import { connect } from "react-redux";
import { RootState } from "./common/store";
import { setUser, setUserToken } from "./common/slices/user.slice";

type Props = {
  setUser: (user: User) => void;
  setUserToken: (token: string) => void;
  currentUser: User;
};

type State = {
}

class App extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.logOut = this.logOut.bind(this);

    this.state = {
      currentUser: undefined,
    };
  }

  async componentDidMount() {
    try {
      this.props.setUser(await AuthService.getCurrentUser());
      const userStr = sessionStorage.user;
      const { userId, token } = JSON.parse(userStr);
      this.props.setUserToken(token)
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  
    EventBus.on("logout", this.logOut);
  }
  

  componentWillUnmount() {
    EventBus.remove("logout", this.logOut);
  }

  logOut() {
    AuthService.logout();
    this.setState({
      currentUser: undefined,
    });
  }

  render() {
    const { currentUser } = this.props;

    return (
      <div>
        <nav className="navbar navbar-expand navbar-dark bg-dark">
          <div className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link to={"/home"} className="nav-link">
                Home
              </Link>
            </li>

            {currentUser && (
              <li className="nav-item">
                <Link to={"/game"} className="nav-link">
                  Game
                </Link>
              </li>
            )}

            {currentUser && (
              <li className="nav-item">
                <Link to={"/highscores"} className="nav-link">
                  High Scores
                </Link>
              </li>
            )}
          </div>

          {currentUser ? (
            <div className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link to={"/profile"} className="nav-link">
                  Profile
                </Link>
              </li>
              <li className="nav-item">
                <a href="/login" className="nav-link" onClick={this.logOut}>
                  Log out
                </a>
              </li>
            </div>
          ) : (
            <div className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link to={"/login"} className="nav-link">
                  Login
                </Link>
              </li>

              <li className="nav-item">
                <Link to={"/register"} className="nav-link">
                  Register
                </Link>
              </li>
            </div>
          )}
        </nav>

        <div className="container mt-3">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/game" element={<Game/>} />
            <Route path="/highscores" element={<HighScores/>} />
          </Routes>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = {
  setUser,
  setUserToken
};

const mapStateToProps = (state: RootState) => {
  return{
    currentUser: state.user.currentUser,
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(App);