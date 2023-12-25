import { Component } from "react";
import UserService from "../services/user.service";
import { setUser } from '../common/slices/user.slice'

import User from "../model/user";
import { connect } from "react-redux";
import { RootState } from "../common/store";

type Props = {
  setUser: (user: User) => void;
  currentUser: User;
};

type State = {
  bioUpdateError: string;
  isEditingBio: boolean;
};

class Profile extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      bioUpdateError: "",
      isEditingBio: false,
    };
  }

  handleEditBioToggle = () => {
    this.setState((prevState) => ({ isEditingBio: !prevState.isEditingBio }));
  };

  handleUpdateBio = async () => {
    const { currentUser } = this.props;

    try {
      const updatedUserData = await UserService.updateUserDetails(
        currentUser,
        sessionStorage.user
      );

      if (updatedUserData) {
        this.setState({isEditingBio: false});
        this.props.setUser(updatedUserData)
      }
      
    } catch (error) {
      console.error("Error updating bio:", error);
      this.setState({
        bioUpdateError: "An unexpected error occurred",
      });
    }
  };

  render() {
    const { isEditingBio } = this.state;
    const { currentUser } = this.props; 


    return (
      <div className="container">
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
                <textarea className="jumbotron" 
                value={currentUser.bio} 
                onChange={ event => this.props.setUser({
                  ...currentUser,
                  bio: event.target.value,
                  })
                }/>
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
      </div>
    );
  }
}

const mapDispatchToProps = {
  setUser
};

const mapStateToProps = (state: RootState) => {
  return{
    currentUser: state.user.currentUser
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);