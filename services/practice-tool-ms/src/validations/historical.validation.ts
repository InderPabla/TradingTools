import { Request } from 'express';
import { param, validationResult, Result, ValidationError } from 'express-validator';

export class HistorialValidation {

    public static async validateHistoricalCandlesticks(req:Request):Promise<Result<ValidationError>> {
        await param('ticker').notEmpty().isString()
            .toUpperCase()
            .run(req);
        await param('candlestickDuration').notEmpty()
            .isString()
            .run(req);
        await param('tradingDayTime').notEmpty().isString().matches(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}/)
            .run(req);
        return validationResult(req);
    }
}