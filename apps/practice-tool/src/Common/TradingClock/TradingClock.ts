type ClockStateType = 'STOPPED'|'UNPAUSED'|'STARTED'|'PAUSED';

export class TradingClock {

    private clock:Date;
    private clockCopyAtUnpaused:Date;
    private timeAtClockUnpaused:Date;
    private clockUpdateInterval:NodeJS.Timeout;
    private update:Function;
    private clockSpeedMultiplier:number;
    private clockState:ClockStateType;

    constructor(clock:Date,update:Function) {
        this.clock = clock;
        this.update = update;
        this.clockSpeedMultiplier = 1;
        this.clockState = 'STOPPED';
    }

    public getClockSpeedMultipler() {
        return this.clockSpeedMultiplier;
    }

    public setClockSpeedMultiplier(clockSpeedMultiplier:number) {
        this.clockSpeedMultiplier = clockSpeedMultiplier;
    }

    public getClock() {
        return this.clock;
    }

    public toggleClock = () =>{
        if(this.isClockRunning()) {
            clearInterval(this.clockUpdateInterval);
            this.clockUpdateInterval = null;
            this.timeAtClockUnpaused = null;
            this.clockCopyAtUnpaused = null;
            this.clockState = 'PAUSED';
        }
        else {
            this.timeAtClockUnpaused = new Date();
            this.clockCopyAtUnpaused = this.clock;
            this.clockUpdateInterval = setInterval(this.updateClock,1000);
            this.clockState = 'UNPAUSED';
        }

        this.update();

        if(this.clockState==='PAUSED') {
            this.clockState = 'STOPPED';
        }
        else if(this.clockState==='UNPAUSED') {
            this.clockState = 'STARTED';
        }
    }

    public isClockRunning():boolean {
        return this.clockState === 'STARTED';
    }

    private updateClock = () => {
        const newDate = new Date();
        const msDiff = newDate.getTime() - this.timeAtClockUnpaused.getTime();
        this.clock = new Date(this.clockCopyAtUnpaused.getTime() + msDiff*this.clockSpeedMultiplier);
        this.update();
    }

    public wasClockUnpaused():boolean {
        return this.clockState === 'UNPAUSED';
    }

    public wasClockPaused():boolean {
        return this.clockState === 'PAUSED';
    }
}