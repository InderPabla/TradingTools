import { Handler, Request, Response, NextFunction } from "express";
import { Result, ValidationError} from 'express-validator';
import { CommonController, CommonError } from "./common-controller";

export class CommonValidatorMiddleware {

    public static validator(valFunc:(req:Request)=>Promise<Result<ValidationError>>):Handler {
        return async (req:Request, res:Response, next:NextFunction) => {
            let validationResult = await valFunc(req);
            if(!validationResult.isEmpty()) {
                let errors:CommonError[] = validationResult.array().map((v:ValidationError)=> {
                    return {
                        type:'VALIDATION_ERROR',
                        message:v.msg,
                        path:[v.param],
                    }
                });
                res.status(400).json(CommonController.validationErrorRes(errors))
            }
            else {
                next();
            }
        }
    }
}