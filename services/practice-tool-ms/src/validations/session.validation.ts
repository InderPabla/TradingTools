import { Request } from 'express';
import { param, body, validationResult, Result, ValidationError } from 'express-validator';
import { SessionService } from '../services/session.service';

export class SessionValidation {

    public static async validateGetSession(req:Request):Promise<Result<ValidationError>> {
        await param('sessionId')
        .notEmpty().isString()
        .custom(value => {
            return SessionService.findSessionIdExists(value);
        }).withMessage('Invalid session id')
        .run(req);
        return validationResult(req);
    }

    public static async validateCreateSession(req:Request):Promise<Result<ValidationError>> {
        await body('sessionId').notEmpty().isString()
        .custom(value => {
            return !SessionService.findSessionIdExists(value);
        }).withMessage('Invalid session id')
        .run(req);
        return validationResult(req);
    }
}