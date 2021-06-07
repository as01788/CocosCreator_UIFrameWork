import { Component, EventTouch, Node, Vec2, _decorator } from "cc";

const {ccclass, property} = _decorator;

@ccclass("TouchPlus")
export default class TouchPlus extends Component {

    private offset  = 15;       // 误差值
    private startPosition: Vec2;
    private isTouch = false;

    private isClick = true;

    private clickEvent: Function;
    private slideEvent: (e: EventTouch) => any;

    /** 添加点击事件和滑动事件 */
    public addEvent(click: Function, slide: (e: EventTouch) => any) {
        this.clickEvent = click;
        this.slideEvent = slide;
    }

    // onLoad () {}

    start () {
        this.node.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.touchCancel, this);
    }


    private touchStart(e: EventTouch) {
        this.isTouch = true;
        this.startPosition = e.getLocation();
    }
    private touchMove(e: EventTouch) {
        if(!this.isTouch) return ;
        let pos = e.getLocation();
        // let len = pos.sub(this.startPosition).mag();
        let len = pos.subtract(this.startPosition).length();
        if(len > this.offset) {
            this.isClick = false;
            // 触发滑动
            this.slideEvent && this.slideEvent(e);
        }
    }
    private touchEnd(e: EventTouch) {
        if(!this.isTouch) return ;
        this.isTouch = false;
        
        this.isClick && this.clickEvent && this.clickEvent(e);

        this.isClick = true;
    }
    private touchCancel(e: EventTouch) {
        if(!this.isTouch) return ;
        this.isTouch = false;

        this.isClick = true;
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.touchCancel, this);
    }

    // update (dt) {}
}
