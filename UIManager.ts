import { _decorator, Component, Node, js, find, UITransform, instantiate, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

import UIBase from "./UIBase";
import { SysDefine, FormType, MaskOpacity } from "./config/SysDefine";
import TipsManager from "./TipsManager";
import ResMgr from "./ResMgr";
import UIMaskManager from "./UIMaskManager";
import AdapterMgr from "./AdapterMgr";

@ccclass('UIManager')
export default class UIManager extends Component {
    private _NoNormal: Node | null = null;                              // 全屏显示的UI 挂载结点
    private _NoFixed: Node | null = null;                               // 固定显示的UI
    private _NoPopUp: Node | null = null;                               // 弹出窗口
    private _NoTips: Node | null = null;                                // 独立窗体
    private _StaCurrentUIForms: Array<UIBase> = [];                                      // 存储弹出的窗体
    private _MapAllUIForms: { [key: string]: UIBase } = js.createMap();                // 所有的窗体
    private _MapCurrentShowUIForms: { [key: string]: UIBase } = js.createMap();        // 正在显示的窗体(不包括弹窗)
    private _MapIndependentForms: { [key: string]: UIBase } = js.createMap();          // 独立窗体 独立于其他窗体, 不受其他窗体的影响
    private _LoadingForm: { [key: string]: boolean } = js.createMap();                 // 正在加载的form 
    private static instance: UIManager = null;                     // 单例
    public static getInstance(): UIManager {
        if (this.instance == null) {
            this.instance = find(SysDefine.SYS_UIROOT_NAME)?.getComponent<UIManager>(this);
            // this.instance = cc.find('')
            if (!this.instance) {
                let newNode = new Node('UIROOT');
                newNode.setParent(find("Canvas"));
                
                let pop = new Node('PopUp');
                let mask = new Node('UIMaskScript');
                let temp = new Node('UIAdaptationScript');
                let sceneBase = new Node('SceneBase');
                let fixedUI = new Node('FixedUI');
                let topTips = new Node('TopTips');

                newNode.addComponent(UITransform);
                mask.addComponent(UITransform);
                pop.addComponent(UITransform);
                temp.addComponent(UITransform);
                sceneBase.addComponent(UITransform);
                fixedUI.addComponent(UITransform);
                topTips.addComponent(UITransform);

                newNode.addComponent(UIOpacity);
                mask.addComponent(UIOpacity);
                pop.addComponent(UIOpacity);
                temp.addComponent(UIOpacity);
                sceneBase.addComponent(UIOpacity);
                fixedUI.addComponent(UIOpacity);
                topTips.addComponent(UIOpacity);

                newNode.addChild(sceneBase);
                newNode.addChild(fixedUI);
                newNode.addChild(pop);
                newNode.addChild(topTips);
                newNode.addChild(mask);
                newNode.addChild(temp);

                
                
                newNode.getComponent(UITransform).setContentSize(AdapterMgr.inst.visibleSize);
                mask.getComponent(UITransform).setContentSize(AdapterMgr.inst.visibleSize);
                pop.getComponent(UITransform).setContentSize(AdapterMgr.inst.visibleSize);

                this.instance = newNode.addComponent<UIManager>(this);

                
            }
        }
        return this.instance;
    }
    onLoad() {
        // 初始化结点
        this._NoNormal = this.node.getChildByName(SysDefine.SYS_SCENEBASE_NODE);
        this._NoFixed = this.node.getChildByName(SysDefine.SYS_FIXEDUI_NODE);
        this._NoPopUp = this.node.getChildByName(SysDefine.SYS_POPUP_NODE);
        this._NoTips = this.node.getChildByName(SysDefine.SYS_TOPTIPS_NODE);

    }
    start() {
    }
    /**  */
    public getComponentByUid(uid: string) {
        return this._MapAllUIForms[uid];
    }
    /** 预加载UIForm */
    public async loadUIForms(...uibases: typeof UIBase[]) {
        for (const uibase of uibases) {
            let uiBase = await this.loadFormsToAllUIFormsCatch(uibase.prefabPath);
            if (!uiBase) {
                console.warn(`${uiBase}没有被成功加载`);
            }
        }
    }
    /**
     * 重要方法 加载显示一个UIForm
     * @param prefabPath 
     * @param obj 初始化信息, 可以不要
     */
    public async openUIForm(prefabPath: string, ...params: any) {
        if (prefabPath === "" || prefabPath == null) return null;
        if (this.checkUIFormIsShowing(prefabPath) || this.checkUIFormIsLoading(prefabPath)) {
            console.warn(`${prefabPath}窗体已经在显示,或者正在加载中!`);
            return null;
        }
        let uiBase = await this.loadFormsToAllUIFormsCatch(prefabPath);
        if (uiBase == null) {
            console.warn(`${prefabPath}未加载!`);
            return null;
        }
        //初始化窗体名称
        uiBase.uid = prefabPath;

        switch (uiBase.formType) {
            case FormType.SceneBase:
                await this.enterUIFormsAndHideOther(prefabPath, ...params);
                break;
            case FormType.FixedUI:
                await this.loadUIToCurrentCache(prefabPath, ...params);
                break;
            case FormType.PopUp:
                await this.pushUIFormToStack(prefabPath, ...params);
                break;
            case FormType.TopTips:                        // 独立显示
                await this.loadUIFormsToIndependent(prefabPath, ...params);
                break;
        }

        return uiBase;
    }
    /**
     * 重要方法 关闭一个UIForm
     * @param prefabPath 
     */
    public async closeUIForm(prefabPath: string){
        if (prefabPath == "" || prefabPath == null) return false;
        let UIBase = this._MapAllUIForms[prefabPath];

        if (UIBase == null) return true;

        switch (UIBase.formType) {
            case FormType.SceneBase:
                await this.exitUIFormsAndDisplayOther(prefabPath);
                break;
            case FormType.FixedUI:                             // 普通模式显示
                await this.exitUIForms(prefabPath);
                break;
            case FormType.PopUp:
                await this.popUIForm();
                break;
            case FormType.TopTips:
                await this.exitIndependentForms(prefabPath);
                break;
        }
        //判断是否销毁该窗体
        if (UIBase.canDestroy) {
            this.destroyForm(UIBase, prefabPath);
        }
        return true;
    }
    /**
     * 从全部的UI窗口中加载, 并挂载到结点上
     */
    private async loadFormsToAllUIFormsCatch(prefabPath: string) {
        let baseUIResult = this._MapAllUIForms[prefabPath];
        //判断窗体不在mapAllUIForms中， 也不再loadingForms中
        if (baseUIResult == null && !this._LoadingForm[prefabPath]) {
            //加载指定名称的“UI窗体
            this._LoadingForm[prefabPath] = true;
            baseUIResult = await this.loadUIForm(prefabPath);
            this._LoadingForm[prefabPath] = false;
            delete this._LoadingForm[prefabPath];
        }
        return baseUIResult;
    }
    /**
     * 从resources中加载
     * @param prefabPath 
     */
    private async loadUIForm(formPath: string) {
        if (formPath == "" || formPath == null) {
            return;
        }

        let pre = await ResMgr.inst.loadForm(formPath);
        if (!pre) {
            console.warn(`${formPath} 资源加载失败, 请确认路径是否正确`);
            return;
        }
        let node: Node = instantiate(pre);
        let baseUI:UIBase = node.getComponent(UIBase);
        if (baseUI == null) {
            console.warn(`${formPath} 没有绑定UIBase的Component`);
            return;
        }
        node.active = false;
        switch (baseUI.formType) {
            case FormType.SceneBase:
                UIManager.getInstance()._NoNormal.addChild(node);
                break;
            case FormType.FixedUI:
                UIManager.getInstance()._NoFixed.addChild(node);
                break;
            case FormType.PopUp:
                UIManager.getInstance()._NoPopUp.addChild(node);
                break;
            case FormType.TopTips:
                UIManager.getInstance()._NoTips.addChild(node);
                break;
        }
        this._MapAllUIForms[formPath] = baseUI;

        return baseUI;
    }
    /**
     * 清除栈内所有窗口
     */
    private async clearStackArray() {
        if (this._StaCurrentUIForms == null || this._StaCurrentUIForms.length <= 0) {
            return;
        }
        for (const baseUI of this._StaCurrentUIForms) {
            await baseUI.closeUIForm();
        }
        this._StaCurrentUIForms = [];
        return;
    }
    /**
     * 关闭栈顶窗口
     */
    public closeTopStackUIForm() {
        if (this._StaCurrentUIForms != null && this._StaCurrentUIForms.length >= 1) {
            let uiFrom = this._StaCurrentUIForms[this._StaCurrentUIForms.length - 1];
            if (uiFrom.maskType.clickMaskClose) {
                // await uiFrom.hideAnimation();
                uiFrom.closeUIForm();
            }
        }
    }
    /**
     * 加载到缓存中, 
     * @param prefabPath 
     */
    private async loadUIToCurrentCache(prefabPath: string, ...params: any) {
        let UIBase: UIBase = null;
        let UIBaseFromAllCache: UIBase = null;

        UIBase = this._MapCurrentShowUIForms[prefabPath];
        if (UIBase != null) return;                                     // 要加载的窗口正在显示

        UIBaseFromAllCache = this._MapAllUIForms[prefabPath];
        if (UIBaseFromAllCache != null) {
            await UIBaseFromAllCache._preInit();
            this._MapCurrentShowUIForms[prefabPath] = UIBaseFromAllCache;

            UIBaseFromAllCache.onShow(...params);
            await this.showForm(UIBaseFromAllCache);
        }
    }
    /**
     * 加载到栈中
     * @param prefabPath 
     */
    private async pushUIFormToStack(prefabPath: string, ...params: any) {
        if (this._StaCurrentUIForms.length > 0) {
            let topUIForm = this._StaCurrentUIForms[this._StaCurrentUIForms.length - 1];
        }
        let UIBase = this._MapAllUIForms[prefabPath];
        if (UIBase == null) return;
        await UIBase._preInit();
        //加入栈中, 同时设置其zIndex 使得后进入的窗体总是显示在上面
        this._StaCurrentUIForms.push(UIBase);
        // UIBase.node.getComponent(UITransform).priority = this._StaCurrentUIForms.length;
        UIBase.node.setSiblingIndex(this._StaCurrentUIForms.length);

        UIBase.onShow(...params);
        await this.showForm(UIBase);
    }
    /**
     * 加载时, 关闭其他窗口
     */
    private async enterUIFormsAndHideOther(prefabPath: string, ...params: any) {
        let UIBase = this._MapCurrentShowUIForms[prefabPath];
        if (UIBase != null) return;

        //隐藏其他窗口 
        for (let key in this._MapCurrentShowUIForms) {
            await this._MapCurrentShowUIForms[key].closeUIForm();
        }
        this._StaCurrentUIForms.forEach(async uiForm => {
            await uiForm.closeUIForm();
        });

        let UIBaseFromAll = this._MapAllUIForms[prefabPath];

        if (UIBaseFromAll == null) return;
        await UIBaseFromAll._preInit();

        this._MapCurrentShowUIForms[prefabPath] = UIBaseFromAll;

        UIBaseFromAll.onShow(...params);
        await this.showForm(UIBaseFromAll);
    }
    /** 加载到独立map中 */
    private async loadUIFormsToIndependent(prefabPath: string, ...params: any) {
        let UIBase = this._MapAllUIForms[prefabPath];
        if (UIBase == null) return;
        await UIBase._preInit();
        this._MapIndependentForms[prefabPath] = UIBase;

        UIBase.onShow(...params);
        await this.showForm(UIBase);
    }
    /**
     * --------------------------------- 关闭窗口 --------------------------
     */
    /**
     * 关闭一个UIForm
     * @param prefabPath 
     */
    private async exitUIForms(prefabPath: string) {
        let UIBase = this._MapAllUIForms[prefabPath];
        if (UIBase == null) return;
        UIBase.onHide();
        await this.hideForm(UIBase);

        this._MapCurrentShowUIForms[prefabPath] = null;
        delete this._MapCurrentShowUIForms[prefabPath];
    }
    private async popUIForm() {
        if (this._StaCurrentUIForms.length >= 1) {
            let topUIForm = this._StaCurrentUIForms.pop();
            topUIForm.onHide();
            await this.hideForm(topUIForm);
        }
    }
    private async exitUIFormsAndDisplayOther(prefabPath: string) {
        if (prefabPath == "" || prefabPath == null) return;

        let UIBase = this._MapCurrentShowUIForms[prefabPath];
        if (UIBase == null) return;
        UIBase.onHide();
        await this.hideForm(UIBase);

        this._MapCurrentShowUIForms[prefabPath] = null;
        delete this._MapCurrentShowUIForms[prefabPath];
    }
    private async exitIndependentForms(prefabPath: string) {
        let UIBase = this._MapAllUIForms[prefabPath];
        if (UIBase == null) return;
        UIBase.onHide();
        await this.hideForm(UIBase);

        this._MapIndependentForms[prefabPath] = null;
        delete this._MapIndependentForms[prefabPath];
    }
    /** bug点，这里的showForm可能会被多次调用，在showMask的时候，baseUI可能会被改变 */
    private async showForm(baseUI: UIBase) {
        baseUI.node.active = true;
        if (baseUI.isAddMask)
            UIMaskManager.getInstance().addMaskWindow(baseUI.node);
        
        //TODO调用2次
        //await baseUI.showAnimation();
        //await UIMaskManager.getInstance().showMask(baseUI.maskType);

        baseUI.node.active = true;
        return new Promise(async (resolve, reject) => {
            //UIMaskManager.getInstance().addMaskWindow(baseUI.node);
            await UIMaskManager.getInstance().showMask(baseUI.maskType);
            await baseUI.showAnimation();
            resolve(null);
        });
    }
    private async hideForm(baseUI: UIBase) {
        UIMaskManager.getInstance().removeMaskWindow(baseUI.node);
        await baseUI.hideAnimation();
        baseUI.node.active = false;
    }
    /** 销毁 */
    private destroyForm(UIBase: UIBase, prefabPath: string) {
        ResMgr.inst.destroyForm(UIBase);
        // 从allmap中删除
        this._MapAllUIForms[prefabPath] = null;
        delete this._MapAllUIForms[prefabPath];
    }
    /** 窗体是否正在显示 */
    public checkUIFormIsShowing(prefabPath: string) {
        let UIBases = this._MapAllUIForms && this._MapAllUIForms[prefabPath];
        if (UIBases == null) {
        return false;
        }
        return UIBases.node.active;
    }
    /** 窗体是否正在加载 */
    public checkUIFormIsLoading(prefabPath: string) {
        let UIBase = this._LoadingForm[prefabPath];
        return !!UIBase;
    }
}
