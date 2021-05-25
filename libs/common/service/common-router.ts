import express from "express";
import { Logger } from "winston";

export abstract class CommonRouter {
    public logger:Logger;
    public path:string;

    private router:express.Router;
    

    constructor(logger:Logger,path:string) {
        this.logger = logger;
        this.path = path;
        this.router = express.Router();
    }

    public getRouter() {
        return this.router;
    }

    public addCommonRouter(other:CommonRouter) {
        this.router.use(`/${other.path}`,other.router);
    }
    
    public abstract register():void;
}