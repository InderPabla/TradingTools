import { Handler, NextFunction, Request, Response } from "express";
import { Logger } from "winston";

export type CommonErrorType = 'VALIDATION_ERROR'|'SYSTEM_ERROR';

export interface CommonError {
    type:CommonErrorType,
    message:string,
    path:string[],
}

export interface CommonResponseType<T> {
    errors:CommonError[],
    result:T,
}

export class CommonController {
    public logger:Logger;

    constructor(logger:Logger) {
        this.logger = logger;
    }

    public unexpectedControllerErrorHandler(controller:(req:Request, res:Response)=>Promise<void>):Handler {
        return async (req:Request, res:Response, next:NextFunction) => {
            try {
                await controller(req,res);
            } catch (error) {
                this.logger.info(`Unexpected Controller Error:`,error);
                res.status(500).json(CommonController.unexpectedErrorResp("Unexpected service error"));
            }
        }   
    }

    public static successResp(result:any):CommonResponseType<any> {
        return { errors:[], result }
    }

    public static validationErrorRes(errors:CommonError[]):CommonResponseType<null> {
        return { errors, result:null }
    }

    public static notFoundErrorRes(message:string):CommonResponseType<null> {
        return { errors:[{type:'VALIDATION_ERROR',message, path:[]}], result:null }
    }

    public static unexpectedErrorResp(message:string):CommonResponseType<null> {
        return { errors:[{type:'SYSTEM_ERROR',message, path:[]}], result:null }
    }
}