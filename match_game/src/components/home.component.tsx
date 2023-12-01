import { Component } from "react";

import UserService from "../services/user.service";

type Props = {};

type State = {
  content: string;
}

export default class Home extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      content: ""
    };
  }

  componentDidMount() {
    const userStr = sessionStorage.getItem('user');
  
    if (userStr !== null) {
      const userId = (JSON.parse(userStr) as { userId: number })?.userId;
  
      if (userId !== undefined) {
        UserService.getUserDetails(userId).then(
          response => {
            this.setState({
              content: response.data
            });
          },
          error => {
            this.setState({
              content:
                (error.response && error.response.data) ||
                error.message ||
                error.toString()
            });
          }
        );
      } else {
        console.error('userId not found in user data');
      }
    } else {
      console.error('User data not found in sessionStorage');
    }
  }
  
  
  
  
  

  render() {
    return (
      <div className="container">
        <header className="jumbotron">
          <h3>{this.state.content}</h3>
        </header>
      </div>
    );
  }
}