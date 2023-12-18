import { Component } from "react";

import UserService from "../services/user.service";
import User from "../model/user";

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
    const userSession = sessionStorage.getItem('user');
  
      if (userSession !== undefined) {
        UserService.getUserDetails(userSession).then(
          response => {
            console.log(response)
            this.setState({
              content: response.username
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
