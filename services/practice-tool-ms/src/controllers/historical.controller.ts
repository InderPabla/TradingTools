import { Logger } from "winston";
import { CommonController } from "../../../../libs/common/service/common-controller";
import { Request, Response } from 'express';
import { CandleSelection, HistorialService } from "../services/historical.service";

export class HistorialController extends CommonController{

    private service:HistorialService;

    constructor(logger:Logger) {
        super(logger);
        this.service = new HistorialService(logger);
        this.getHistoricalCsvData = this.getHistoricalCsvData.bind(this);
    }

    async getHistoricalCsvData(req:Request,res:Response) {
        let selection:CandleSelection = {
            ticker:req.params.ticker,
            tradingDayTime:req.params.tradingDayTime,
            candlestickDuration:req.params.candlestickDuration
        }
        let csv = await this.service.getCandlestickCsv(selection)
        if(csv==null)
            res.status(404).json(CommonController.notFoundErrorRes("Invalid historical selection"));
        else
            res.status(200).json(CommonController.successResp(csv));
    }
}