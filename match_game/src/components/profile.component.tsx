import React, { Component, ChangeEvent } from "react";
import { Navigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import UserService from "../services/user.service";
import User from "../model/user";

type Props = {};

type State = {
  redirect: string | null;
  userReady: boolean;
  currentUser: User;
  bioUpdateError: string;
  isEditingBio: boolean;
};

class Profile extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      redirect: null,
      userReady: false,
      currentUser: {} as User,
      bioUpdateError: "",
      isEditingBio: false,
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

  handleBioChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { currentUser } = this.state;
    const updatedUser: User = {
      ...currentUser,
      bio: event.target.value,
    };
    this.setState({ currentUser: updatedUser });
  };

  handleEditBioToggle = () => {
    this.setState((prevState) => ({ isEditingBio: !prevState.isEditingBio }));
  };

  handleUpdateBio = async () => {
    const { currentUser } = this.state;

    try {
      const updatedUserData = await UserService.updateUserDetails(
        currentUser,
        sessionStorage.user
      );

      if (updatedUserData) {
        this.setState({
          currentUser: updatedUserData,
          isEditingBio: false,
        });
      } else {
        this.setState({
          bioUpdateError: "Failed to update bio",
        });
      }
    } catch (error) {
      console.error("Error updating bio:", error);
      this.setState({
        bioUpdateError: "An unexpected error occurred",
      });
    }
  };

  render() {
    if (this.state.redirect) {
      return <Navigate to={this.state.redirect} />;
    }

    const { currentUser, isEditingBio } = this.state;

    return (
      <div className="container">
        {this.state.userReady && (
          <div>
            <header className="jumbotron">
              <h3>
                <strong>{currentUser.username}</strong>
              </h3>
              <p>
                <strong>User ID:</strong> {currentUser.id}
              </p>
            </header>
            <div>
              <h3>Bio:</h3>

              {isEditingBio ? (
                <textarea className="jumbotron" value={currentUser.bio} onChange={this.handleBioChange}/>
              ) : (
                <p className="jumbotron">{currentUser.bio}</p>
              )}
            </div>

            {isEditingBio && (
              <button onClick={this.handleUpdateBio}>Save</button>
            )}
            
            <button onClick={this.handleEditBioToggle}>
              {isEditingBio ? "Cancel" : "Edit"}
            </button>

            {this.state.bioUpdateError && (
              <p style={{ color: "red" }}>{this.state.bioUpdateError}</p>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default Profile;
