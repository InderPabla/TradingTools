import { Logger } from "winston";
import { CommonController } from "../../../../libs/common/service/common-controller";
import { Request, Response } from 'express';
import { SessionService } from "../services/session.service";

export class SessionController extends CommonController{

    private service:SessionService;

    constructor(logger:Logger) {
        super(logger);
        this.service = new SessionService(logger);
        this.getSession = this.getSession.bind(this);
    }

    async getSession(req:Request,res:Response) {
        let sessionId = req.params.sessionId;
        let info = SessionService.getSession(sessionId);
        res.status(200).json(CommonController.successResp(info));
    }

    async createSession(req:Request,res:Response) {
        let sessionId:string = req.body.sessionId;
        let info = SessionService.createSession(sessionId);
        res.status(200).json(CommonController.successResp(info));
    }
    
}