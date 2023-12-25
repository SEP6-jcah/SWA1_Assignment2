import { Component } from "react";
import { connect } from 'react-redux'

import { RootState } from "../common/store"
import User from "../model/user";


type Props = { 
  currentUser: User 
  token: string 
};

class Home extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { currentUser, token } = this.props; 
    
    return (
      <div className="container">
        <header className="jumbotron">
          <h3>Welcome, {currentUser.username}</h3>
          <h4>Your session token is: {token}</h4>
        </header>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  return{
    currentUser: state.user.currentUser,
    token: state.user.token,
  }
};

export default connect(mapStateToProps )(Home);
