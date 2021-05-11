import { throws } from "node:assert";
import { CommonAPI, IAjaxDataError, IAjaxError } from "../../../Common/Api";
import { ChartContinousData, ChartSelection } from "../ChartUtils";

export type FuncSelectionToFilename = (sel:ChartSelection)=>string

export interface ChatDataLoaderActions {
    load:(sel:ChartSelection)=>Promise<ChartContinousData[]>;
}

export abstract class ChartDataLoader {
    abstract load(sel:ChartSelection):Promise<IAjaxDataError<ChartContinousData[]>>;
}

export class PublicFileChartDataLoader extends ChartDataLoader{
    private selToFilename:FuncSelectionToFilename;
    private path:string;

    constructor(path:string, selToFilename:FuncSelectionToFilename) {
        super();
        this.selToFilename = selToFilename;
        this.path = path;
    }

    async load(sel:ChartSelection):Promise<IAjaxDataError<ChartContinousData[]>> {
        let _continData:ChartContinousData[] = [];
        let _err:IAjaxError = null;

        await CommonAPI.ajaxHandler(
            async () => {
                _continData = await CommonAPI.getContinousDataFromPublicCsvFile(this.path,this.selToFilename(sel));
            },
            async (err:IAjaxError)=> {
                _err = err;
            }
        );

        return {data:_continData,err:_err};
    }
}