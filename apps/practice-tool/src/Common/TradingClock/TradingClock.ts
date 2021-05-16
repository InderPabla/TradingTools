import { logBase } from "../Utils";

type ClockStateType = 'STOPPED'|'UNPAUSED'|'STARTED'|'PAUSED';
export const VALID_CLOCK_SPEED_MULTIPLIERS = [1,5,10,50,100,500,1000];
export const MAX_RESET_MS = 1000;
export const MIN_RESET_MS = 100;

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
        this.clockSpeedMultiplier = VALID_CLOCK_SPEED_MULTIPLIERS[0];
        this.clockState = 'STOPPED';
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

    private static getClockResetTimeMs(clockSpeedMulti:number):number {
        const RESET = Math.max(MAX_RESET_MS/(logBase(clockSpeedMulti,2.15)+1),MIN_RESET_MS);
        return RESET;
    }

    public getClock() {
        return this.clock;
    }

    public setClock(clock:Date) {
        this.clock = clock;
        if(this.isClockRunning()) {
            this.toggleClock();
        }
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
            this.clockUpdateInterval = setInterval(this.updateClock,TradingClock.getClockResetTimeMs(this.clockSpeedMultiplier));
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