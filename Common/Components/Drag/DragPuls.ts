
import { _decorator, Component, Node, EventHandler, Button, EventTouch, CCInteger, Vec2, director, Vec3 } from 'cc';
import { DragSlot } from './DragSlot';
const { ccclass, property } = _decorator;

@ccclass('DragPuls')
export class DragPuls extends Component {

    @property({
        // type:Boolean,
        tooltip: "是否可镶嵌",
        displayOrder: 0
    })
    public isCanSet: boolean = false;
    @property({
        type: CCInteger,
        tooltip: "可镶嵌槽的ID",
        visible: function () {
            return this.isCanSet === true;
        }
    })
    public slotIDs: number[] = [];


    @property({
        type: EventHandler,
        tooltip: "开始拖拽",
    })
    public start_drag: EventHandler[] = [];
    @property({
        type: EventHandler,
        tooltip: "拖拽中",
    })
    public move_drag: EventHandler[] = [];
    @property({
        type: EventHandler,
        tooltip: "拖拽结束",
    })
    public end_drag: EventHandler[] = [];
    @property({
        type: EventHandler,
        tooltip: "嵌套到槽中时",
    })
    public in_event: EventHandler[] = [];
    @property({
        type: EventHandler,
        tooltip: "从槽中卸载时",
    })
    public out_event: EventHandler[] = [];

    private parent: Node;
    private lastPos: Vec2;
    private slot: DragSlot;

    public get Slot() {
        return this.slot;
    }

    start() {
        this.parent = this.node.parent;
        this.node.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.touchEnd, this);

        //新增一个镶嵌时调换的事件
        let handler = new EventHandler();
        handler.target = this.node;
        handler.component = "DragPuls";
        handler.handler = "install";
        handler.customEventData="slot";
        this.in_event.push(handler);

        let handler2 = new EventHandler();
        handler2.target = this.node;
        handler2.component = "DragPuls";
        handler2.handler = "uninstall";
        handler2.customEventData="slot";
        this.out_event.push(handler);
    }

    private touchStart(event: EventTouch) {
        this.lastPos = event.getLocation();
        this.node.setParent(this.parent, true);
        if (this.start_drag.length > 0) {
            this.start_drag.forEach(handler => {
                handler.emit(null);
            });
        }
    }
    private touchMove(event: EventTouch) {
        this.node.position = this.node.position.add(event.getUIDelta().ToVec3());
        if (this.move_drag.length > 0) {
            this.move_drag.forEach(handler => {
                handler.emit(null);
            });
        }
    }
    private touchEnd(event: EventTouch) {
        event.propagationImmediateStopped = false;
        if (this.end_drag.length > 0) {
            this.end_drag.forEach(handler => {
                handler.emit(null);
            });
        }
        if (this.isCanSet && window.DragHelper.DragEnd(this)) {
            // if(!window.DragHelper.DragEnd(this)){
            // if(this.slot){
            //     this.node.setParent(this.slot.node);
            //     this.node.setPosition(Vec3.ZERO);
            // }else{
            //     this.node.setPosition(this.lastPos.x,this.lastPos.y,0);
            // }
            // }
        } else {
            if (this.slot) {
                this.node.setParent(this.slot.node);
                this.node.setPosition(this.slot.offsetPos);
            } else {
                this.node.setPosition(this.lastPos.x, this.lastPos.y, 0);
            }
        }
    }

    install(slot: DragSlot) {
        this.slot = slot;
    }
    uninstall(){
        this.slot=null;
    }

}


