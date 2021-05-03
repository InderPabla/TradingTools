
import * as React from 'react';
import {Container,Row,Col} from 'react-bootstrap';
import { PracticeToolOLD } from '../PracticeToolOLD/PracticeToolOLD';
import './PracticeTool.css';

export interface PracticeToolProps {

}

export interface PracticeToolState {

}

export class PracticeTool extends React.Component<PracticeToolProps,PracticeToolState> {
    divRef:any;

    constructor(props) {
      super(props);
      this.state = {

      }
    }

    async componentDidMount() {
        this.updateEverySecond();
    }

    private updateEverySecond() {
        setTimeout(()=> {
            this.setState({});
        },2000);
    }

    public render() {
        
        //https://stackoverflow.com/questions/60554808/react-useref-with-typescript-and-functional-component
        return (
            <React.Fragment>
                <div id="practice-tool">
                    <div className="practice-tool-container-title">
                        <h1 style={{fontSize:"4vh"}}>Practice Tool</h1>
                    </div>
                    <div className="practice-tool-container-outter">
                        <Container fluid={true} className="practice-tool-container">
                            <Row xl={12} noGutters={true} className="flex-nowrap practice-tool-row">
                                <Col xl={6} className="practice-tool-col-container">
                                    <div 
                                        ref={(ref) => this.divRef = ref}
                                        className="practice-tool-col">

                                        {/* {this.divRef && <PracticeToolOLD width={this.divRef.clientWidth} height={this.divRef.clientHeight}/>} */}
                                    </div>
                                </Col>
                                <Col xl={6} className="practice-tool-col-container">
                                    <div className="practice-tool-col">
                                        {/* {this.divRef && <PracticeToolOLD width={this.divRef.clientWidth} height={this.divRef.clientHeight}/>} */}
                                    </div>
                                </Col>
                            </Row>
                            <Row xl={12} noGutters={true} className="flex-nowrap practice-tool-row">
                                <Col xl={6} className="practice-tool-col-container">
                                    <div className="practice-tool-col">
                                        {/* {this.divRef && <PracticeToolOLD width={this.divRef.clientWidth} height={this.divRef.clientHeight}/>} */}
                                    </div>
                                </Col>
                                <Col xl={6} className="practice-tool-col-container">
                                    <div className="practice-tool-col">
                                        {/* <h1 style={{fontSize:"4vh"}}>Chart 4</h1> */}
                                        {/* {this.divRef && <PracticeToolOLD width={this.divRef.clientWidth} height={this.divRef.clientHeight}/>} */}
                                    </div>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                    
                </div>
            </React.Fragment>
        );
    }
  }
