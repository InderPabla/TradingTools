import {CommonRouterConfig} from '../../libs/common/router/common-router-config';

class PracticeToolMs extends CommonRouterConfig{

    constructor() {
        super();
        this.createRoutes();
    }

    public createRoutes() {
        
    }
}

try {
    new PracticeToolMs();
}
catch(err) {
    console.log(`Unxpected Error Starting PracticeToolMs`,err);
}

