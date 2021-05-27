import { CommonAPI, IAjaxDataError, IAjaxError } from "../CommonAPI";
import { ChartContinousData, ChartSelection } from "../../Components/Chart/Commom/ChartUtils";
import { HistorialAPI } from "../Api/HistorialAPI";

export type FuncSelectionToFilename = (sel:ChartSelection)=>string

export abstract class ChartDataLoader {
    private savedCopy:Map<string,ChartContinousData[]>;

    constructor() {
        this.savedCopy = new Map<string,ChartContinousData[]>();
    }

    abstract fetchDataFromAPI(sel:ChartSelection):Promise<IAjaxDataError<ChartContinousData[]>>;

    private static selectionToKey(sel:ChartSelection):string {
        return sel.candlestickDuration+sel.ticker+sel.tradingDayTime.getTime();
    }
  
    public async getData(sel:ChartSelection):Promise<ChartContinousData[]> {
        const key = ChartDataLoader.selectionToKey(sel);
        if(this.savedCopy.has(key)) return this.savedCopy.get(key);

        const fetchedData = await this.fetchDataFromAPI(sel);
        if(fetchedData.data) this.savedCopy.set(key,fetchedData.data);

        return fetchedData.data;
    }
}

export class ServiceChartDataLoader extends ChartDataLoader {
    constructor() {
        super();
    }

    async fetchDataFromAPI(sel:ChartSelection):Promise<IAjaxDataError<ChartContinousData[]>> {
        let _continData:ChartContinousData[] = null;
        let _err:IAjaxError = null;

        await CommonAPI.ajaxHandler(
            async () => {
                _continData = await HistorialAPI.getContinousData(sel);
            },
            async (err:IAjaxError)=> {
                _err = err;
            }
        );

        return {data:_continData,err:_err};
    }
}