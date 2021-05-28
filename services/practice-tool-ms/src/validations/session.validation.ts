import { Request } from 'express';
import { param, body, validationResult, Result, ValidationError, ValidationChain } from 'express-validator';
import { SessionService } from '../services/session.service';
import { CommonValidation } from '../../../../libs/common/service/common-validation';

export class SessionValidation extends CommonValidation{

    public static async validateGetSession(req:Request):Promise<Result<ValidationError>> {
        await SessionValidation.validateSessionIdChain(param,true)
            .run(req);
        return validationResult(req);
    }

    public static async validateCreateSession(req:Request):Promise<Result<ValidationError>> {
        await CommonValidation.notEmptyStringChain(body('tradingDay'))
            .matches(/^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/)
                .withMessage('Must be a yyyy-mm-dd format')
                .bail()
            .run(req);    
        return validationResult(req);
    }

    private static validateSessionIdChain(location:(key:string)=>ValidationChain, shouldSessionExist:boolean):ValidationChain {
        return CommonValidation.notEmptyStringChain(location('sessionId'))
        .custom(value => {
            let sessionExists = SessionService.findSessionIdExists(value);
            return (sessionExists && shouldSessionExist) || (!sessionExists && !shouldSessionExist);
        })
            .withMessage('Invalid session id')
            .bail();
    }
}