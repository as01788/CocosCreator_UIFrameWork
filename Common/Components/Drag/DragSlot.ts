
import { _decorator, Component, Node, CCInteger, EventHandler, Vec3, game, CCBoolean } from 'cc';
import { DragPlus } from './DragPlus';
const { ccclass, property } = _decorator;

/**
 * 拖拽镶嵌槽
 */
@ccclass('DragSlot')
export class DragSlot extends Component {

    @property({
        type: CCInteger,
        tooltip: "镶嵌槽的id,方便判断是否可镶嵌"
    })
    public slotID: number = 0;

    //TODO在编辑器下设置的数值无法在游戏中使用
    // public get SlotID(){
    //     return this.slotID;
    // }
    // public set SlotID(id:number){
    //     this.slotID=id;
    //     window.DragHelper.switchSlotID(this);
    // }

    @property({
        // type:CCBoolean,
        tooltip: "如果已存在物品，是否跟物品的上一个槽调换物品(如果有的话)"
    })
    public isExchange: boolean = true;

    @property({
        type: Vec3,
        tooltip: "嵌套时的物品位置偏移"
    })
    public offsetPos: Vec3 = new Vec3(0, 0, 0);

    @property({
        type: EventHandler,
        tooltip: "镶嵌时事件"
    })
    public in_event: EventHandler[] = [];
    @property({
        type: EventHandler,
        tooltip: "卸载时事件"
    })
    public out_event: EventHandler[] = [];
    @property({
        type: EventHandler,
        tooltip: "点击事件"
    })
    public click_event: EventHandler[] = [];

    private item: DragPlus;

    onLoad() {
        let isClick = false;
        this.node.on(Node.EventType.MOUSE_DOWN, () => { isClick = true }, this);
        this.node.on(Node.EventType.MOUSE_LEAVE,()=>{isClick=false},this);

        this.node.on(Node.EventType.MOUSE_UP, () => {
            if (isClick) {
                if (this.click_event.length > 0) {
                    this.click_event.forEach(e => {
                        e.emit([this]);
                    });
                }
            }
            isClick = false;
        }, this);
    }

    Install(item: DragPlus) {

        if (item) {
            //如果已存在物品
            if (this.isExchange && this.item) {
                if (item.Slot) {
                    item.Slot.Install(this.item);
                }
            }

            item.node.setParent(this.node);
            item.node.setPosition(this.offsetPos);
            this.item = item;

            if (this.in_event.length > 0) {
                this.in_event.forEach(e => {
                    e.emit([item]);
                });
            }
            if (item.in_event.length > 0) {
                item.in_event.forEach(e => {
                    e.emit([this]);
                });
            }
        }
    }
    Uninstall() {
        if (!this.item) return;

        if (this.out_event.length > 0) {
            this.out_event.forEach(e => {
                e.emit([this.item]);
            });
        }
        if (this.item.out_event.length > 0) {
            this.item.out_event.forEach(e => {
                e.emit([this]);
            });
        }
        this.item = null;
    }

    onEnable() {
        window.DragHelper.addSlot(this);
    }
    onDisable() {
        window.DragHelper.delSlot(this);
    }
    onDestroy() {
        window.DragHelper.delSlot(this);
    }
}

