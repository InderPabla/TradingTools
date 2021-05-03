
import React from "react";
import {
	EdgeIndicator,
} from "react-stockcharts/lib/coordinates";


export interface AutoEdgeIndicatorProps {
	minPrice:number,
	maxPrice:number,
	spacingPrice:number,
}

export interface CandleStickChartState {
	width:number;
	height:number;
}

export class AutoEdgeIndicator extends React.Component<AutoEdgeIndicatorProps> {
	public static defaultProps = {
        spacingPrice:0.2
    };

	constructor(props:AutoEdgeIndicatorProps) {
		super(props);

	}

	render() {
		const { minPrice, maxPrice, spacingPrice } = this.props;

		//https://rrag.github.io/react-stockcharts/documentation.html#/zoom_and_pan
		//Fork with zoomAnchor: https://github.com/reactivemarkets/react-financial-charts/blob/master/packages/stories/src/features/StockChart.tsx

		/**
		 * Convert to function!
		 */
		let autoEdgeIndicatorTicks:number[] = [];
		let _max = Math.ceil(maxPrice +1);
		let _min = Math.floor(minPrice - 1);
		let autoTicksLen:number = (_max-_min)/spacingPrice;
		let minPriceTick:number = _min;
		
		for(let i = 0; i <autoTicksLen; i++) {
			autoEdgeIndicatorTicks.push(minPriceTick);
			minPriceTick+=spacingPrice;
		}

		return (
	        <React.Fragment>
				{autoEdgeIndicatorTicks.map((v)=>{
					return <EdgeIndicator
						key = {`auto-edge-indicator-${v}`}
						itemType="first"
						orient="left"
						edgeAt="left"
						yAccessor={d=>v}
						fill={"#ff7f0e"}
						rectHeight={0}
						arrowWidth={0}
						rectWidth={0}
						fontSize={0}
						strokeWidth={10}
					/>
            	})}
			</React.Fragment>
        );
	}
}

// CandleStickChart = fitWidth(CandleStickChart);
