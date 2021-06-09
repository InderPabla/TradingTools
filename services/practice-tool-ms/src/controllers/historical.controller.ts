import { Logger } from "winston";
import { CommonController } from "../../../../libs/common/service/common-controller";
import { Request, Response } from 'express';
import { CandleSelection, HistorialService } from "../services/historical.service";
import { ChartContinousData } from "practice-tool-types";

export class HistorialController extends CommonController{

    private service:HistorialService;

    constructor(logger:Logger) {
        super(logger);
        this.service = new HistorialService(logger);
        this.getHistoricalData = this.getHistoricalData.bind(this);
    }

    async getHistoricalData(req:Request,res:Response) {
        let selection:CandleSelection = {
            ticker:req.params.ticker,
            tradingDay:req.params.tradingDay,
            candlestickDuration:req.params.candlestickDuration
        }
        let data = await this.service.getCandlestickDataOnSelection(selection)
        if(data==null)
            res.status(400).json(CommonController.notFoundErrorRes("Invalid historical selection"));
        else
            res.status(200).json(CommonController.successResp(data));
    }
}