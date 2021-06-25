import * as React from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';
import './IndicatorInfoModal.css';
import { ChartIndicator, ChartIndicatorFactory, ChartIndicatorMetadata, IndicatorClassType, INDICATOR_CLASSES } from '../../Chart/Commom/ChartSet';

export interface IndicatorInfoModalProps {
    show:boolean;
    initialIndicator:ChartIndicator[],
    save:(indicators:ChartIndicator[])=>void;
}

export interface IndicatorInfoModalState {
    metas:ChartIndicatorMetadata[];
}

export class IndicatorInfoModal extends React.Component<IndicatorInfoModalProps,IndicatorInfoModalState> {

    constructor(props:IndicatorInfoModalProps) {
        super(props);
        this.state = {
            metas: props.initialIndicator.map(v=>v.getMetadata()),
        };
    }
    
    private handleDone = async () => {
        const { save } = this.props;
        save(this.state.metas.map(v=>ChartIndicatorFactory.toIndicatorFromClassType(v.getClassType(),v)));
    }

    private addIndicatorClass(cl:IndicatorClassType) {
        const {metas} = this.state;
        metas.push(cl.getDefaultMetadata());
        this.setState({});
    }

    private removeMetaAtIndex(index:number) {
        const {metas} = this.state;
        metas.splice(index,1);
        this.setState({});
    }

    private renderAvailableIndicators() {
        return (
            <React.Fragment>
                {INDICATOR_CLASSES.map((cl:IndicatorClassType)=> {
                    return this.renderIndicatorClassType(cl);
                })}
            </React.Fragment>
        );
    }

    private renderIndicatorClassType(cl:IndicatorClassType) {
        let meta = cl.getDefaultMetadata();
        return <React.Fragment key={`class-${cl.name}`}>
            <div className={"indicator-class-container"}>
                <p>
                    <span className="fa fa-plus" onClick={()=>{this.addIndicatorClass(cl)}}/> 
                    <span className="indicator-name">{meta.getIndicatorName()}</span>
                </p>
            </div>
        </React.Fragment>
    }

    private renderSelectedIndicators() {
        const { metas } = this.state;
        return (
            <React.Fragment>
                {metas.map((m,idx)=> {
                    return this.renderSelectedIndicatorMeta(m,idx,`meta-${idx}-${m.getIndicatorName()}`);
                })}
            </React.Fragment>
        );
    }

    private renderSelectedIndicatorMeta(meta:ChartIndicatorMetadata,index:number, key:string) {
        let extraName = meta.getKeysMeta().map(v=>v.getValue()).join(',');
        if(extraName.length>0) extraName = `(${extraName})`;
        return (<React.Fragment key={key}>
            <div className={"indicator-class-container indicator-active"}>
                <p> <span className="fa fa-edit"/> 
                    <span className="fa fa-trash" onClick={()=>{this.removeMetaAtIndex(index)}}/> 
                    <span className="indicator-name">{meta.getIndicatorName()}{extraName}</span>
                </p>
            </div>
        </React.Fragment>);
    }

    public render() {
        const { show } = this.props;
        const { } = this.state;
        return (
            <React.Fragment>
                <Modal 
                    id={"indicator-info-modal"} 
                    show={show} 
                    onHide={()=>{}}  
                    animation={false}>
                    <Modal.Header>
                        <Modal.Title>Indicators</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

                        <Row xl={12} noGutters={true} className="flex-nowrap">
                            <Col className="indicator-panel indicator-left" xl={4}>
                                {this.renderAvailableIndicators()}
                            </Col>
                            <Col className="indicator-panel indicator-right" xl={8}>
                                {this.renderSelectedIndicators()}
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button   
                            variant="primary" 
                            onClick={this.handleDone} 
                            disabled={false}>
                            Done
                        </Button>
                    </Modal.Footer>
                </Modal>    
            </React.Fragment>
        );
    }
    
}
