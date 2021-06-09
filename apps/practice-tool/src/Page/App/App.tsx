
import logo from './logo.svg';
import * as React from 'react';
import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';

import {BrowserRouter , Route, browserHistory} from 'react-router-dom'

import '@trendmicro/react-sidenav/dist/react-sidenav.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import './App.css';

import { Home } from '../Home/Home';
import { PracticeTool } from '../PracticeTool/PracticeTool';

class App extends React.Component {


    public render() {
      return (
          <div className="App">
              <BrowserRouter>
                <Route render={({ location, history }) => (
                    <React.Fragment>
                        <SideNav
                            className={"app-navigation"}
                            onSelect={(selected) => {
                                const to = '/' + selected;
                                if (location.pathname !== to) {
                                    history.push(to);
                                }
                            }}
                        >
                            <SideNav.Toggle />
                            <SideNav.Nav defaultSelected="home">
                                <NavItem eventKey="home">
                                    <NavIcon>
                                        <i className="fa fa-fw fa-home" style={{ fontSize: '1.75em',color:'white' }} />
                                    </NavIcon>
                                    <NavText> 
                                        Home
                                    </NavText>
                                </NavItem>
                                <NavItem eventKey="practice-tool">
                                    <NavIcon>
                                        <i className="fa fa-book" style={{ fontSize: '1.75em', color:'white' }} />
                                    </NavIcon>
                                    <NavText>
                                        Practice Tool
                                    </NavText>
                                </NavItem>
                            </SideNav.Nav>
                        </SideNav>
                        <main className = "sidenav-content-container">
                            <Route path="/" exact component={props => <Home />} />
                            <Route path="/home" component={props => <Home />} />
                            <Route path="/practice-tool" component={props => <PracticeTool/>} />
                        </main>
                    </React.Fragment>
                )}
                />
            </BrowserRouter>
          </div>
      );
    }
  }
  
  export default App;