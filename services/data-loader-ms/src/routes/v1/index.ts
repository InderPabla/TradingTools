import { CommonRouter } from '../../../../../libs/common/service/common-router';
import { Logger } from "winston";

export class RoutesV1 extends CommonRouter{

    constructor(logger:Logger) {
        super(logger,'v1');
    }

    public register() {
        
    }

}