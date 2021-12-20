import { Router } from "express";
import { Logger } from "winston";
import { CommonRouter } from "../../../../../libs/common/service/common-router";
import { DataLoaderValidation } from "../../validations/data-loader.validation";
import { validationResult, param } from 'express-validator';
import { DataLoaderController } from "../../controllers/data-loader.controller";
import { CommonValidatorMiddleware } from "../../../../../libs/common/service/common-middleware";

export class DataLoaderRoute extends CommonRouter {
    private controller:DataLoaderController;

    constructor(logger:Logger) {
        super(logger,'data-loader');
        this.controller = new DataLoaderController(logger);
    }

    public register() {
        let router = this.getRouter();

        router.get(
            `/candles/:ticker/:candlestickDuration/:tradingDay`
            ,CommonValidatorMiddleware.validator(DataLoaderValidation.validateHistoricalCandlesticks)
            ,this.controller.unexpectedControllerErrorHandler(this.controller.getHistoricalData)
        );
    }
}