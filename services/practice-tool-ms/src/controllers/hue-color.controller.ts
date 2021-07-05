import { Logger } from "winston";
import { CommonController } from "../../../../libs/common/service/common-controller";
import { Request, Response } from 'express';
import { HueColorService } from "../services/hue-color.service";
import Color from "color";

export class HueColorController extends CommonController{

    private service:HueColorService;

    constructor(logger:Logger) {
        super(logger);
        this.service = new HueColorService(logger);
        this.postChangeHueRgbColor = this.postChangeHueRgbColor.bind(this);
    }

    async postChangeHueRgbColor(req:Request,res:Response) {
        let color:{r:number,g:number,b:number} = req.body.color;
        let lights:string[] = req.body.lights;
        this.service.changeLightColors(Color.rgb(color.r,color.g,color.b),lights);
        res.status(200).json({});
    }
}