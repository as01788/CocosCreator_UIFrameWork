
import { SysDefine } from "./config/SysDefine";
import UIMaskScript from "./UIMaskScript";
import UIBase from "./UIBase";
import { MaskType } from "./FrameType";
import { _decorator, Component, find, Texture2D, Node, UITransform, UIOpacity, Layers } from "cc";
/**
 * 遮罩管理
 */
const {ccclass, property} = _decorator;

@ccclass("UIMaskManager")
export default class UIMaskManager extends Component {

    //public block:BlockInputEvents;

    public static instance: UIMaskManager = null;
    public static getInstance() {
        if(this.instance == null) {
            this.instance = find(SysDefine.SYS_UIMASK_NAME).addComponent<UIMaskManager>(this);
        }
        return this.instance;
    }
    private uiMaskScript:UIMaskScript = null;
    maskTexture: Texture2D = null;
    /** 添加mask, 这个时候会阻断点击事件 */
    public addMaskWindow(parent: Node) {
        if(parent.getChildByName("UIMaskNode") || !parent.getComponent(UIBase)) {
            return ;
        }
        this.uiMaskScript = MaskNodePool.getInstance().get(parent);
    }
    /** 为mask添加颜色 */
    public async showMask(maskType: MaskType) {
        await this.uiMaskScript?.showMaskUI(maskType.opacity, maskType.easingTime, maskType.isEasing);
    }
    /** 去掉mask */
    public removeMaskWindow(parent: Node) {
        MaskNodePool.getInstance().put(parent);
    }
}

/** 结点池 */
export class MaskNodePool {
    public static instance: MaskNodePool = null;
    public static getInstance() {
        if(this.instance == null) {
            this.instance = new MaskNodePool();
        }
        return this.instance;
    }

    private pool: Array<UIMaskScript> = [];

    public init() {
        for(let i=0; i<3; i++) {
            let com = new Node("UIMaskNode").addComponent(UIMaskScript);
            com.node.layer=Layers.BitMask.UI_2D;
            com.addComponent(UITransform);
            com.addComponent(UIOpacity);
            com.init();
            this.pool.push(com);
        }
    }

    /** 释放一个 */
    public get(parent: Node) {
        if(this.pool.length <= 0) {
            this.init();
        }
        let com = this.pool.pop();
        com.reuse(parent.getComponent(UIBase).uid);
        parent.insertChild(com.node, -1);
        return com;
    }
    /** 回收结点 */
    public put(parent: Node) {
        let node = parent.getChildByName("UIMaskNode")
        if(!node || !node.getComponent(UIMaskScript)) {
            console.log("不是对应类型的结点, 无法回收!");
            return false;
        }
        node.removeFromParent();
        let com = node.getComponent(UIMaskScript);
        com.unuse();
        this.pool.push(com);
        return true;
    }
    /** 清除结点池 */
    clear() {
        for(const com of this.pool) {
            com.unuse();
        }
        this.pool = [];
    }
}