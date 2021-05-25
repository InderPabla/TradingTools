import { Router } from "express";
import { Logger } from "winston";
import { CommonRouter } from "../../../../../libs/common/service/common-router";
import { HistorialValidation } from "../../validations/historical.validation";
import { validationResult, param } from 'express-validator';
import { ValidatorMiddleware } from "../../middlewares/validator";
import { HistorialController } from "../../controllers/historical.controller";

export class HistorialRoute extends CommonRouter {
    private controller:HistorialController;

    constructor(logger:Logger) {
        super(logger,'historical');
        this.controller = new HistorialController(logger);
    }

    public register() {
        let router = this.getRouter();

        router.get(
            `/candles/:ticker/:candlestickDuration/:tradingDayTime/csv`
            ,ValidatorMiddleware.validator(HistorialValidation.validateHistoricalCandlesticks)
            ,this.controller.unexpectedControllerErrorHandler(this.controller.historicalCsvData)
        );
    }
}