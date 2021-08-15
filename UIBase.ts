import UIBinder from "./UIBinder";
import CocosHelper from "./CocosHelper";
// import UIManager from "./UIManager";
import { FormType, SysDefine } from "./config/SysDefine";
import { MaskType } from "./FrameType";
import Binder from "./Binder";
import AdapterMgr from "./AdapterMgr";
import TipsManager from "./TipsManager";
import { BlockInputEvents, find, macro, Node, tween, UITransform, Vec3, _decorator } from "cc";
// import { autorun, IReactionPublic, observable } from "./lib/aa-mobx";
// import UIMaskManager from "./UIMaskManager";

const { ccclass, property } = _decorator;

@ccclass("UIBase")
export default class UIBase extends UIBinder {

    /** 窗体id,该窗体的唯一标示(请不要对这个值进行赋值操作, 内部已经实现了对应的赋值) */
    public uid: string;
    /** 窗体类型 */
    public formType: FormType;
    /** 阴影类型, 只对PopUp类型窗体启用 */
    public maskType = new MaskType();
    public isAddMask:boolean=true;
    /** 关闭窗口后销毁, 会将其依赖的资源一并销毁, 采用了引用计数的管理, 不用担心会影响其他窗体 */
    public canDestroy = false;
    /** 自动绑定结点 */
    public autoBind = true;
    /** 回调 */
    protected _cb: (confirm: any) => void;
    /** 是否已经调用过preinit方法 */
    private _initd = false;

    /** 资源路径，如果没写的话就是类名 */
    public static _prefabPath = "";
    public static set prefabPath(path: string) {
        this._prefabPath = path;
    }
    public static get prefabPath() {
        if (!this._prefabPath || this._prefabPath.length <= 0) {
            this._prefabPath = SysDefine.UI_PATH_ROOT + CocosHelper.getComponentName(this);
        }
        return this._prefabPath;
    }

    /** 打开关闭UIBase */
    public static async openView(...params: any): Promise<UIBase> {
        return await window.UIManager.openUIForm(this.prefabPath, ...params);
    }
    public static async openViewWithLoading(...params: any): Promise<UIBase> {
        await TipsManager.getInstance().showLoadingForm(this.prefabPath);
        let uiBase = await this.openView(...params);
        await TipsManager.getInstance().hideLoadingForm();
        return uiBase;
    }
    public static async closeView(): Promise<boolean> {
        return await window.UIManager.closeUIForm(this.prefabPath);
    }

    

    /** 预先初始化 */
    public async _preInit() {
        if (this._initd) return;
        this._initd = true;
        if (this.autoBind) {
            Binder.bindComponent(this);
        }
        //autorun(this.refreshView.bind(this));
        // 加载这个UI依赖的其他资源，其他资源可以也是UI
        await this.load();
    }

    //@observable
    model: any = null;
    /**
     * 这个函数在model的数值发生变化时（前提条件是在这个函数中用到了model），会自动执行，无需手动调用
     * @param r 
     */
    // public refreshView(r: IReactionPublic) {

    // }

    /** 可以在这里进行一些资源的加载, 具体实现可以看test下的代码 */
    public async load() {

    }

    public onShow(...obj: any) { }

    public onHide() { }

    /** 通过闭包，保留resolve.在合适的时间调用cb方法 */
    public waitPromise(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._cb = (confirm: any) => {
                resolve(confirm);
            }
        });
    }

    /**
     * 
     * @param uiFormName 窗体名称
     * @param obj 参数
     */
    public async showUIForm(uiFormName: string, ...obj: any): Promise<UIBase> {

        return await window.UIManager.openUIForm(uiFormName, obj);
    }
    public async closeUIForm(): Promise<boolean> {

        return await window.UIManager.closeUIForm(this.uid);
    }

    /**
     * 弹窗动画
     */
    public async showAnimation(node?:Node) {
        if (this.formType === FormType.PopUp) {
            if(!node){
                node=this.node;
            }
            node.scale = Vec3.ZERO;
            await CocosHelper.runSyncTween(node,tween()
                .to(0.3, { scale: Vec3.ONE }, { easing:"backOut"})
            );
        }
        if (this._blocker)
            this._blocker.node.active = true;
    }
    public async hideAnimation(node?:Node) {
        if (this.formType === FormType.PopUp) {
            if(!node){
                node=this.node;
            }
            node.scale = Vec3.ONE;
            await CocosHelper.runSyncTween(node, tween()
                .to(0.3, { scale: Vec3.ZERO }, { easing: "backIn" })
            );
        }
        if (this._blocker)
            this._blocker.node.active = false;
    }

    /** 设置是否挡住触摸事件 */
    private _blocker: BlockInputEvents = null;
    public setBlockInput(block: boolean, clickCallback?: Function) {
        if (block && !this._blocker) {
            let node = find('block_input_events', this.node.parent);
            if (!node) {
                node = new Node('block_input_events');
                this.node.parent.insertChild(node,-1);
            }
            this._blocker = node.getComponent(BlockInputEvents);
            if (!this._blocker)
                this._blocker = node.addComponent(BlockInputEvents);
            this._blocker.node.getComponent(UITransform).setContentSize(AdapterMgr.inst.visibleSize);
            if (clickCallback) {
                this._blocker.node.on(Node.EventType.TOUCH_END, clickCallback, this);
            }
        } else if (!block && this._blocker) {
            this._blocker.node.destroy();
            this._blocker.node.removeFromParent();
            this._blocker = null;
        }
    }
}
