type IAjaxErrorType = 'UNEXPECTED_ERROR'|'NOT_FOUND'|'BAD_REQUEST';

export interface IAjaxError {
    status?:number;
    type?:IAjaxErrorType;
    message:string;
}

export interface IAjaxDataError<T> {
    data:T;
    err:IAjaxError;
}

type OnError = (err:IAjaxError)=>Promise<void>;

export class CommonAPI {

    public static unexpectedIAjaxError(message?:string):IAjaxError {
        return {status:null,type:'UNEXPECTED_ERROR',message:message || 'Unexpected error fetching resource'};
    }

    public static notFoundIAjaxError(message?:string):IAjaxError {
        return {status:404,type:'NOT_FOUND',message:message || 'Resource not found'};
    }

    public static badRequestAjaxError(message?:string):IAjaxError {
        return {status:400,type:'BAD_REQUEST',message:message || 'Invalid Resource request'};
    }

    public static async ajaxHandler(func:()=>Promise<void>,onError:OnError) {
        try {
            await func();
        }
        catch(err) {
            if(err) {
                if(err.status===400) {
                    await onError(CommonAPI.badRequestAjaxError(err.message));
                }
                else if(err.status===404) {
                    await onError(CommonAPI.notFoundIAjaxError(err.message));
                }
                else {
                    await onError(CommonAPI.unexpectedIAjaxError(err.message));
                } 
            }
            else {
                await onError(CommonAPI.unexpectedIAjaxError());
            }
        }
    }



}