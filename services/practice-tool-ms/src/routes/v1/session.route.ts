import { Router } from "express";
import { Logger } from "winston";
import { CommonRouter } from "../../../../../libs/common/service/common-router";
import { SessionValidation } from "../../validations/session.validation";
import { validationResult, param } from 'express-validator';
import { ValidatorMiddleware } from "../../middlewares/validator";
import { SessionController } from "../../controllers/session.controller";

export class SessionRoute extends CommonRouter {
    private controller:SessionController;

    constructor(logger:Logger) {
        super(logger,'session');
        this.controller = new SessionController(logger);
    }

    public register() {
        let router = this.getRouter();

        router.put(
            `/:sessionId/start`
            ,ValidatorMiddleware.validator(SessionValidation.validateGetSession)
            ,this.controller.unexpectedControllerErrorHandler(this.controller.startSession)
        );

        router.put(
            `/:sessionId/stop`
            ,ValidatorMiddleware.validator(SessionValidation.validateGetSession)
            ,this.controller.unexpectedControllerErrorHandler(this.controller.stopSession)
        );

        router.get(
            `/:sessionId`
            ,ValidatorMiddleware.validator(SessionValidation.validateGetSession)
            ,this.controller.unexpectedControllerErrorHandler(this.controller.getSession)
        );

        router.post(
            `/`
            ,ValidatorMiddleware.validator(SessionValidation.validateCreateSession)
            ,this.controller.unexpectedControllerErrorHandler(this.controller.createSession)
        );
    }
}