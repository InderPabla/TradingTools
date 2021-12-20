
import * as React from 'react';
import { TopBar } from '../../Components/TopBar/TopBar';

export interface DataLoaderProps {

}

export interface DataLoaderState {

}

/**
 * Page deals with loading allowing user to pick data that will be loader from back-end loading service
 */
export class DataLoader extends React.Component<DataLoaderProps,DataLoaderState> {

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
              <div id="data-loader" style={{height:"100vh"}}>
                  <TopBar title="Data Loader" icon="download">

                  </TopBar>
              </div>
          </React.Fragment>
      );
    }
  }
