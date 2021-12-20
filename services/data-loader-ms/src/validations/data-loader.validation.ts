import { Request } from 'express';
import { param, validationResult, Result, ValidationError, ValidationChain } from 'express-validator';
import { CommonValidation } from '../../../../libs/common/service/common-validation';

/**
 * Class to deal with data loader validation
 */
export class DataLoaderValidation extends CommonValidation{

    public static async validateHistoricalCandlesticks(req:Request):Promise<Result<ValidationError>> {
        await CommonValidation.notEmptyStringChain(param('ticker'))
            .toUpperCase()
            .run(req);
        await CommonValidation.notEmptyStringChain(param('candlestickDuration'))
            .toUpperCase()
            .run(req);
        await CommonValidation.notEmptyStringChain(param('tradingDay'))
            .matches(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}/)
                .withMessage('Must be a yyyy-mm-dd format')
                .bail()
            .run(req);
        return validationResult(req);
    }
}