
import * as React from 'react';

import { Modal, Button, DropdownButton, Dropdown, InputGroup, FormControl } from 'react-bootstrap';
import { SessionInfo } from 'practice-tool-types';
import { toDayTradingTime, yyyymmdd } from '../../../Common/Utils';
import { SessionAPI } from '../../../Common/Api/SessionAPI';
import { SessionInfoWrapper } from '../../../Common/TradingClock/SessionInfoWrapper';
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import moment from 'moment';
import './SessionInfoModal.css';
type SessionLocation = 'SERVER'|'CLIENT';

const SESSION_LOCATIONS:SessionLocation[] = ['SERVER','CLIENT'];

export interface SessionInfoModalModalProps {
    show:boolean;
    save:(sessionInfo:SessionInfoWrapper,lights:string[])=>void;
    onError:(errMessage:string)=>void;
}

export interface SessionInfoModalModalState {
    sessionInfo:SessionInfo;
    sessionLocation:SessionLocation;
    lights:string,
}

export class SessionInfoModal extends React.Component<SessionInfoModalModalProps,SessionInfoModalModalState> {

    constructor(props:SessionInfoModalModalProps) {
        super(props);
        // let todayDate = new Date();
        // todayDate.setDate(2); //TESTING REMOVE!!!
        // todayDate.setTime(todayDate.getTime()+todayDate.getTimezoneOffset()*60*1000);
        //"2021-06-22"
        let clock = toDayTradingTime(new Date(),false);
        this.state = {
            sessionInfo:{
                isRunning:false,
                sessionId:null,
                tradingDay:yyyymmdd(clock),
                clock,
                pnl:0,
            },
            sessionLocation:'SERVER',
            lights:''
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
                
            save(new SessionInfoWrapper(newSessionInfo),this.state.lights.split(',').filter(v=>v.length>0));
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

    private onChangeLightIds = (lights:string) => {
        this.setState({lights});
    }

    private isSaveable () {
        const { sessionInfo, sessionLocation } = this.state;
        return true;
    }

    private onTradingDayTimeChanged (newTradingDayTime:Date) {
        const {sessionInfo} = this.state;
        if(sessionInfo.clock.getTime() !== newTradingDayTime.getTime()) {
            sessionInfo.clock = newTradingDayTime;
            sessionInfo.tradingDay = yyyymmdd(newTradingDayTime);
            this.setState({});
        }
    }

    public render() {
        const { show } = this.props;
        const { sessionInfo,sessionLocation,lights } = this.state;
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
                                {SESSION_LOCATIONS.map((location)=> {
                                    return <Dropdown.Item 
                                                key={`session-location-dropdown-button-${location}`} 
                                                eventKey={location}>{location}</Dropdown.Item>;
                                })}
                            </DropdownButton>
                        </div>
                        <Datetime 
                                    inputProps={{disabled:false}}
                                    initialValue={this.state.sessionInfo.clock}
                                    onChange={(value)=>{this.onTradingDayTimeChanged(moment(value).toDate())}}  
                                />
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
                        {<div className="session-server-location-container">
                            <p>Light Ids: </p>
                            <InputGroup>
                                <FormControl
                                    className="session-id-capture"
                                    placeholder="9,10" 
                                    onKeyUp={(event)=> {
                                        event.stopPropagation();
                                        event.nativeEvent.stopImmediatePropagation();
                                    }}
                                    onChange={(event)=>{
                                        this.onChangeLightIds(event.target.value)
                                    }}
                                    onKeyPress={(event)=>{}}
                                    defaultValue={lights} 
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
