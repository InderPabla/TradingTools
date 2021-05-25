import {Request,Response,NextFunction,Handler} from 'express';
import { Logger } from 'winston';

export abstract class CommonServiceBase {
    public logger:Logger;

    constructor(logger:Logger) {
        this.logger = logger;
    }

}