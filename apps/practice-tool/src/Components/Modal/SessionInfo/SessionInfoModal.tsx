
import * as React from 'react';
import './SessionInfoModal.css';
import { Modal, Button, DropdownButton, Dropdown, InputGroup, FormControl } from 'react-bootstrap';
import { SessionInfo } from 'practice-tool-types';
import { toDayTradingTime, yyyymmdd } from '../../../Common/Utils';
import { SessionAPI } from '../../../Common/Api/SessionAPI';
import { SessionInfoWrapper } from '../../../Common/TradingClock/SessionInfoWrapper';

type SessionLocation = 'SERVER'|'CLIENT';

export interface SessionInfoModalModalProps {
    show:boolean;
    save:(sessionInfo:SessionInfoWrapper)=>void;
    onError:(errMessage:string)=>void;
}

export interface SessionInfoModalModalState {
    sessionInfo:SessionInfo;
    sessionLocation:SessionLocation;
}

export class SessionInfoModal extends React.Component<SessionInfoModalModalProps,SessionInfoModalModalState> {

    constructor(props) {
        super(props);
        // let todayDate = new Date();
        // todayDate.setDate(2); //TESTING REMOVE!!!
        // todayDate.setTime(todayDate.getTime()+todayDate.getTimezoneOffset()*60*1000);
        let clock = toDayTradingTime(new Date("2021-02-05"),true);
        this.state = {
            sessionInfo:{
                isRunning:false,
                sessionId:null,
                tradingDay:yyyymmdd(clock),
                clock,
            },
            sessionLocation:'CLIENT',
        };
    }
    
    private handleDone = async () => {
        const { save, onError } = this.props;
        const { sessionInfo } = this.state;
        try {
            let newSessionInfo:SessionInfo = null;

            if(this.isServerExistingSession()) 
                newSessionInfo = await SessionAPI.getSession(sessionInfo.sessionId);
            else if(this.isServerNewSession()) 
                newSessionInfo = await SessionAPI.postCreateSession(sessionInfo.tradingDay, sessionInfo.clock);
            else 
                newSessionInfo = sessionInfo;
                
            save(new SessionInfoWrapper(newSessionInfo));
        }
        catch(err) {
            onError('Unable to create or join session')
        }  
    }

    private isServerExistingSession() {
        const { sessionInfo:{sessionId} } = this.state;
        return this.isServerSession() && !!sessionId;
    }

    private isServerNewSession() {
        const { sessionInfo:{sessionId} } = this.state;
        return this.isServerSession() && !sessionId;
    }

    private isClientSession() {
        return !this.isServerSession();
    }

    private isServerSession() {
        const { sessionLocation } = this.state;
        if(sessionLocation === 'SERVER') return true;
        return false;
    }

    private getDoneButtonTitle() {
        if(this.isServerExistingSession()) return `Existing Server Session`;
        else if(this.isServerNewSession()) return `New Server Session`;
        return `New Client Session`;
    }

    private onSessionLocationSelected = (sessionLocation:string) => {
        const { sessionInfo } = this.state;
        if(sessionLocation === 'CLIENT') {
            sessionInfo.sessionId = null;
        }
        this.setState({sessionLocation:sessionLocation as SessionLocation})
    }

    private onChangeSessionId = (sessionId:string) => {
        const { sessionInfo } = this.state;
        sessionInfo.sessionId = sessionId;
        this.setState({});
    }

    private isSaveable () {
        const { sessionInfo, sessionLocation } = this.state;
        return true;
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
                        {this.isServerSession() && <div className="session-server-location-container">
                            <p>Existing Session Id: </p>
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
                        <Button   
                            variant="primary" 
                            onClick={this.handleDone} 
                            disabled={!this.isSaveable()}>
                            {this.getDoneButtonTitle()}
                        </Button>
                    </Modal.Footer>
                </Modal>    
            </React.Fragment>
        );
    }
  }
