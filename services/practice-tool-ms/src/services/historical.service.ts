import { Logger } from "winston";
import { CommonServiceBase } from "../../../../libs/common/service/common-service-base";
import fs from 'fs';

export interface CandleSelection {
    tradingDay:string;
    ticker:string;
    candlestickDuration:string;
}

export class HistorialService extends CommonServiceBase {
    constructor(logger:Logger) {
        super(logger);
    }

    private selectionToTimeDuration(sel:CandleSelection):string {
        let days = sel.candlestickDuration==="MIN_5"?'DAY_3'
        :sel.candlestickDuration==="DAY_1"?'WEEK_26'
        :'DAY_1';
        return days;
    }

    async getCandlestickCsv(sel:CandleSelection):Promise<string> {
        let filename:string = `${sel.ticker}-${sel.tradingDay}-23-59-59-${this.selectionToTimeDuration(sel)}-${sel.candlestickDuration}.csv`;
        let filePath = `${__dirname}/../../public/data/${filename}`;
        try {
            return await fs.readFileSync(filePath,'utf-8');
        }
        catch(err) {
            this.logger.info(`Unable to fetch file: ${filePath}`,err);
            return null as  any;
        }
    }
}