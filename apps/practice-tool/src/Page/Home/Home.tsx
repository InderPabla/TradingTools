
import * as React from 'react';

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
              <div>
                  <div>
                      <h1>Home</h1>
                  </div>
                  <div >

                  </div>
              </div>
          </React.Fragment>
      );
    }
  }
