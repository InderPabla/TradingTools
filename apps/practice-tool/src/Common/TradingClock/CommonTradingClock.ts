type ClockStateType = 'STOPPED'|'UNPAUSED'|'STARTED'|'PAUSED';

export const VALID_CLOCK_SPEED_MULTIPLIERS = [1,5,10,50,100,500,1000];

export abstract class CommonTradingClock {
    private clock:Date;
    private clockDuringUnpause:Date;
    private update:Function;
    private clockState:ClockStateType;
    private clockSpeedMultiplier:number;
    private systemTimeAtUnpause:Date;
    private clockUpdateInterval:NodeJS.Timeout;

    constructor(clock:Date,update:Function) {
        this.clock = clock;
        this.update = update;
        this.clockSpeedMultiplier = VALID_CLOCK_SPEED_MULTIPLIERS[0];
        this.clockState = 'STOPPED';

        this.updateClock = this.updateClock.bind(this);
    }

    public getClockSpeedMultipler() {
        return this.clockSpeedMultiplier;
    }
    
    public setClockSpeedMultiplier(clockSpeedMultiplier:number) {
        this.clockSpeedMultiplier = clockSpeedMultiplier;
        if(this.isClockRunning()) {
            this.toggleClock();
        }
    }

    public getClock() {
        return this.clock;
    }

    public setClock(clock:Date) {
        this.clock = clock;
    }

    public changeClock(clock:Date) {
        this.clock = clock;
        if(this.isClockRunning()) {
            this.toggleClock();
        }
    }

    public notifyUpdate():void {
        this.update();
    }

    public isClockRunning():boolean {
        return this.clockState === 'STARTED';
    }

    public wasClockUnpaused():boolean {
        return this.clockState === 'UNPAUSED';
    }

    public wasClockPaused():boolean {
        return this.clockState === 'PAUSED';
    }

    public toggleClock = async () =>{
        
        if(this.isClockRunning()) {
            let res = await this.shouldPauseClock();
            if(!res) return;
            clearInterval(this.clockUpdateInterval);
            this.clockUpdateInterval = null;
            this.systemTimeAtUnpause = null;
            this.clockDuringUnpause = null;
            this.clockState = 'PAUSED';
        }
        else {
            let res = await this.shouldUnpauseClock();
            if(!res) return;
            this.systemTimeAtUnpause = new Date();
            this.clockDuringUnpause = this.getClock();
            this.clockUpdateInterval = setInterval(this.updateClock,this.getResetTime());
            this.clockState = 'UNPAUSED';
        }

        this.notifyUpdate();

        if(this.clockState==='PAUSED') {
            this.clockState = 'STOPPED';
        }
        else if(this.clockState==='UNPAUSED') {
            this.clockState = 'STARTED';
        }
    }

    public async updateClock() {
        this.onClockUpdate();
        this.notifyUpdate();
    }

    public getClockDuringUnpause() {
        return this.clockDuringUnpause;
    }

    public getSystemTimeAtUnpause() {
        return this.systemTimeAtUnpause;
    }

    public abstract shouldPauseClock():Promise<boolean>;
    public abstract shouldUnpauseClock():Promise<boolean>;
    public abstract onClockUpdate():Promise<void>;
    public abstract getResetTime():number;
}
