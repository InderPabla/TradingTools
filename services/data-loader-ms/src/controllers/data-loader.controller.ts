import { Logger } from "winston";
import { CommonController } from "../../../../libs/common/service/common-controller";
import { Request, Response } from 'express';
import { DataLoaderService } from "../services/data-loader.service";

export class DataLoaderController extends CommonController{

    private service:DataLoaderService;

    constructor(logger:Logger) {
        super(logger);
        this.service = new DataLoaderService(logger);
        this.getHistoricalData = this.getHistoricalData.bind(this);
    }

    async getHistoricalData(req:Request,res:Response) {

    }
}