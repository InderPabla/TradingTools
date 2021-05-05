
import * as React from 'react';
import { TopBar } from '../../Components/TopBar/TopBar';

export interface HomeProps {

}

export interface HomeState {

}

export class Home extends React.Component<HomeProps,HomeState> {

    constructor(props) {
      super(props);
      this.state = {

      }
    }

    async componentDidMount() {

    }

    public render() {

      return (
          <React.Fragment>
              <div id="home-tool" style={{height:"100vh"}}>
                  <TopBar title="Home" icon="home">

                  </TopBar>
              </div>
          </React.Fragment>
      );
    }
  }
