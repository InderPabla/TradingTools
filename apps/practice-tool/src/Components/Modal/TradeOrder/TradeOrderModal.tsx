import * as React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { PriceType } from '../../../Page/PracticeTool/PracticeTool';
import './TradeOrderModal.css';

export interface TradeOrderModalProps {
    show:boolean;
    save:(ticker:string,priceType:PriceType)=>void;
    initialPriceType:PriceType;
    ticker:string;

}

export interface TradeOrderModalState {
    priceType:PriceType;
}

export class TradeOrderModal extends React.Component<TradeOrderModalProps,TradeOrderModalState> {

    constructor(props:TradeOrderModalProps) {
        super(props);
        this.state = {
            priceType:null,
        };
    }
    
    private onSave = async () => {
        const { save,ticker } = this.props;
        save(ticker,this.state.priceType);
    }

    shouldComponentUpdate(nextProps: Readonly<TradeOrderModalProps>, nextState: Readonly<TradeOrderModalState>, nextContext: any): boolean {
        if(this.state.priceType==null) {
            return true;
        }
        return false;
    }

    componentDidUpdate() {
        if(this.state.priceType==null) {
            this.setState({priceType:JSON.parse(JSON.stringify(this.props.initialPriceType)) as PriceType})
        }
    }
z
    private onDelete(type:string, index:number) {
        let { priceType } = this.state;
        (priceType[type] as number[]).splice(index,1);
        this.setState({},()=>{this.forceUpdate()});
    }

    private renderSelection(type:string, prices:number[]) {

        if(prices.length==0) return null;
        return (<React.Fragment>
            <div className="trade-order-container">
                <p className="trade-order-type">{type}</p>
                {prices.map((num,idx)=><p className="trade-order-num"><span onClick={()=>{this.onDelete(type,idx)}} className='fa fa-close'/> {num}</p>)}
            </div>
            
        </React.Fragment>);
    }

    public render() {
        const { show,ticker } = this.props;
        const { priceType } = this.state;

        return(<React.Fragment key={`trade-order-${ticker}`}>
            <Modal 
                    id={"trade-order-modal"} 
                    show={show} 
                    onHide={()=>{}}  
                    animation={false}>
                    <Modal.Header>
                        <Modal.Title>Trade Order: {ticker}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {priceType && this.renderSelection("BUY",priceType.BUY)}
                        {priceType && this.renderSelection("SELL",priceType.SELL)}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button   
                            variant="primary" 
                            onClick={this.onSave} 
                            disabled={false}>
                            Done
                        </Button>
                    </Modal.Footer>
                </Modal>    

        </React.Fragment>);
        
    }
    
}
