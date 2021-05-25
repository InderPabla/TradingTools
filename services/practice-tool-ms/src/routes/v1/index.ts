import express from "express";
import { HistorialRoute } from "./historical.route";
import { CommonRouter } from '../../../../../libs/common/service/common-router';
import { Logger } from "winston";
import { SessionRoute } from "./session.route";

export class RoutesV1 extends CommonRouter{

    constructor(logger:Logger) {
        super(logger,'v1');
    }

    public register() {
        let historicalRoutes = new HistorialRoute(this.logger);
        historicalRoutes.register();

        let sessionRoutes = new SessionRoute(this.logger);
        sessionRoutes.register();

        this.addCommonRouter(historicalRoutes);
        this.addCommonRouter(sessionRoutes);
    }

}