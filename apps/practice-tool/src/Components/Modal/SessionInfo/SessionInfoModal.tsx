
import * as React from 'react';
import './SessionInfoModal.css';
import { Modal, Button, DropdownButton, Dropdown, InputGroup, FormControl } from 'react-bootstrap';
import { SessionInfo } from 'practice-tool-types';
import { yyyymmdd } from '../../../Common/Utils';

type SessionLocation = 'SERVER'|'CLIENT';

export interface SessionInfoModalModalProps {
    show:boolean;
    save:(sessionInfo:SessionInfo)=>void;
}

export interface SessionInfoModalModalState {
    sessionInfo:SessionInfo;
    sessionLocation:SessionLocation;
}

export class SessionInfoModal extends React.Component<SessionInfoModalModalProps,SessionInfoModalModalState> {

    constructor(props) {
        super(props);
        this.state = {
            sessionInfo:{
                isRunning:false,
                sessionId:null,
                tradingDay:yyyymmdd(new Date())
            },
            sessionLocation:'CLIENT',
        };
    }
    
    private handleDone = () => {
        const { save } = this.props;
        const { sessionInfo } = this.state;
        save(sessionInfo);
    }

    private handleClose = () => {
        const { save } = this.props;
        const { sessionInfo } = this.state;
        save(sessionInfo);
    } 

    private getDoneButtonTitle() {
        if(this.isServer()) return `Begin Server Session`;
        return `Begin Client Session`;
    }

    private isServer() {
        const { sessionLocation } = this.state;
        if(sessionLocation === 'SERVER') return true;
        return false;
    }

    private onSessionLocationSelected = (sessionLocation:string) => {
        this.setState({sessionLocation:sessionLocation as SessionLocation})
    }

    private onChangeSessionId = (sessionId:string) => {
        const { sessionInfo } = this.state;
        sessionInfo.sessionId = sessionId;
        this.setState({});
    }

    public render() {
        const { show } = this.props;
        const { sessionInfo,sessionLocation } = this.state;
        return (
            <React.Fragment>
                <Modal 
                    id={"selection-info-modal"} 
                    show={show} 
                    onHide={()=>{}}  
                    animation={false}>
                    <Modal.Header>
                        <Modal.Title>Session Information</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="session-location">
                            <p>Session Location: </p>
                            <DropdownButton
                                defaultValue={sessionLocation}
                                id="session-location-button" 
                                title={sessionLocation} 
                                size="sm"
                                onSelect={this.onSessionLocationSelected}>
                                {['SERVER','CLIENT'].map((location)=> {
                                    return <Dropdown.Item 
                                                key={`session-location-dropdown-button-${location}`} 
                                                eventKey={location}>{location}</Dropdown.Item>;
                                })}
                            </DropdownButton>
                        </div>
                        {this.isServer() && <div className="session-server-location-container">
                            <p>Session Id: </p>
                            <InputGroup>
                                <FormControl
                                    className="session-id-capture"
                                    placeholder="Session Id" 
                                    onKeyUp={(event)=> {
                                        event.stopPropagation();
                                        event.nativeEvent.stopImmediatePropagation();
                                    }}
                                    onChange={(event)=>{
                                        this.onChangeSessionId(event.target.value)
                                    }}
                                    onKeyPress={(event)=>{}}
                                    defaultValue={sessionInfo.sessionId} 
                                />
                            </InputGroup>        
                        </div>}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={this.handleDone}>
                            {this.getDoneButtonTitle()}
                        </Button>
                    </Modal.Footer>
                </Modal>    
            </React.Fragment>
        );
    }
  }
