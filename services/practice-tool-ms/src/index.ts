import {CommonMsBase} from '../../../libs/common/service/common-ms-base';
import { RoutesV1 } from './routes/v1';

class PracticeToolMs extends CommonMsBase{

    constructor() {
        super();
        this.createRoutes();
    }

    public createRoutes() {
        let v1 = new RoutesV1(this.logger);
        v1.register(); 
        this.app.use(`/${v1.path}`,v1.getRouter());
    }
}

try {
    new PracticeToolMs();
}
catch(err) {
    console.log(`Unxpected Error Starting PracticeToolMs`,err);
}

