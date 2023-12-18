import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import AuthService from "../services/auth.service";

type Props = {};

type State = {
  redirect: string | null,
  userReady: boolean,
  currentUser: {
    username?: string,
    id?: number,
    accessToken?: string
  }
};

class Profile extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      redirect: null,
      userReady: false,
      currentUser: {}
    };
  }

  async componentDidMount() {
    const currentUser = await AuthService.getCurrentUser();

    if (!currentUser) {
      this.setState({ redirect: "/home" });
    } else {
      this.setState({ currentUser, userReady: true });
    }
  }

  render() {
    if (this.state.redirect) {
      return <Navigate to={this.state.redirect} />;
    }

    const { currentUser } = this.state;

    return (
      <div className="container">
        {this.state.userReady ? (
          <div>
            <header className="jumbotron">
              <h3>
                <strong>{currentUser.username}</strong> Profile
              </h3>
            </header>
            <p>
              <strong>Token:</strong>{" "}
              {currentUser.accessToken &&
                currentUser.accessToken.substring(0, 20)} ...{" "}
              {currentUser.accessToken &&
                currentUser.accessToken.substr(currentUser.accessToken.length - 20)}
            </p>
            <p>
              <strong>User ID:</strong>{" "}
              {currentUser.id}
            </p>
          </div>
        ) : null}
      </div>
    );
  }
}

export default Profile;
