import express, { NextFunction } from "express";
import path from "path";
import winston from 'winston';
import expressWinston from 'express-winston';
import { CommonController } from "./common-controller";
import cors from 'cors';
import bodyParser from 'body-parser';

export interface ICommonMsBase{
    logger:winston.Logger;
    app:express.Express;
    port:number;
}

export abstract class CommonMsBase implements ICommonMsBase{

    logger:winston.Logger;

    app:express.Express;
    port:number;

    constructor(port:number=3000) {
        this.port = port;
        this.logger = winston.createLogger({
            transports: [
                new winston.transports.Console()
            ]
        });
        
        this.app = express();
        this.app.use(cors());
        this.app.use(bodyParser.json());
        
        this.app.use(expressWinston.logger({
            transports: [
                new winston.transports.Console()
            ],
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.json()
            ),
            meta: true, // optional: control whether you want to log the meta data about the request (default to true)
            msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
            expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
            colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
            ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
        }));

        this.createBaseRoutes();
        this.createRoutes();

        
        this.app.listen(this.port,()=>{
            this.logger.info(`Started ${this.constructor.name} on port ${this.port}`);
        });
    }

    private createBaseRoutes() {
        this.app.get('/health',this.healthCheckRoute);
    }

    private async healthCheckRoute(req:express.Request,res:express.Response,next:express.NextFunction) {
        res.status(200).json(CommonController.successResp({status:'healthy'}));
    }

    public abstract createRoutes():void;

    
}