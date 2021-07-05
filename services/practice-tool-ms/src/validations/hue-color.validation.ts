import { Request } from 'express';
import { body, validationResult, Result, ValidationError, ValidationChain } from 'express-validator';
import { CommonValidation } from '../../../../libs/common/service/common-validation';

export class HueColorValidation extends CommonValidation{

    public static async validatePostChangeHueRgbColor(req:Request):Promise<Result<ValidationError>> {
        
        await body('color')
            .notEmpty()
                .withMessage('Cannot be empty.')
                .bail()
            .run(req);
            await body('lights')
            .notEmpty()
                .withMessage('Cannot be empty.')
            .isArray()
                .withMessage('Must be an array.')
                .bail()
            .run(req);
        return validationResult(req);
    }
}