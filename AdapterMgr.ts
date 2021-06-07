/**
 * @Author: 邓朗 
 * @Date: 2019-06-12 17:18:04  
 * @Describe: 适配组件, 主要适配背景大小,窗体的位置
 */

import { _decorator, Component, Size, Node, director, Director, find, view, sys, Widget, UITransform } from 'cc';
const { ccclass, property } = _decorator;

import { SysDefine } from './config/SysDefine';
/**  */
export enum AdaptaterType {
    Center = 0,
    Top = 1,
    Bottom = 2,
    Left = 3,
    Right = 4,
    FullScreen = 5,
}

@ccclass('AdapterMgr')
export default class AdapterMgr extends Component {
    private static _instance: AdapterMgr = null;                     // 单例
    public static get inst() {
        if (this._instance == null) {
            this._instance = find(SysDefine.SYS_UIAdaptation_NAME).addComponent<AdapterMgr>(this);
            director.once(Director.EVENT_AFTER_SCENE_LAUNCH, () => {
                this._instance = null;
            });
        }
        return this._instance;
    }

    /** 屏幕尺寸 */
    public visibleSize: Size;
    onLoad() {
        this.visibleSize = view.getVisibleSize();
        // ['visibleSize'] = this.visibleSize;
        console.log(`当前屏幕尺寸为${this.visibleSize}`);
    }
    start() { }
    /**
     * 适配靠边的UI
     * @param type 
     * @param node 
     * @param distance 
     */
    adapatByType(type: AdaptaterType, node: Node, distance?: number) {
        let widget = node.getComponent(Widget);
        if (!widget) {
            widget = node.addComponent(Widget);
        }
        switch (type) {
            case AdaptaterType.Top:
                if (sys.platform === sys.WECHAT_GAME) {     // 微信小游戏适配刘海屏
                    let menuInfo = window["wx"].getMenuButtonBoundingClientRect();
                    let systemInfo = window["wx"].getSystemInfoSync();
                    distance = find("Canvas").getComponent(UITransform).height * (menuInfo.top / systemInfo.screenHeight);
                }
                widget.top = distance ? distance : 0;
                widget.isAbsoluteTop = true;
                widget.isAlignTop = true;
                break;
            case AdaptaterType.Bottom:
                widget.bottom = distance ? distance : 0;
                widget.isAbsoluteBottom = true;
                widget.isAlignBottom = true;
                break;
            case AdaptaterType.Left:
                widget.left = distance ? distance : 0;
                widget.isAbsoluteLeft = true;
                widget.isAlignLeft = true;
                break;
            case AdaptaterType.Right:
                widget.right = distance ? distance : 0;
                widget.isAbsoluteRight = true;
                widget.isAlignRight = true;
                break;
            case AdaptaterType.FullScreen:
                widget.right = 0;
                widget.left = 0;
                widget.top = 0;
                widget.bottom = 0;
                widget.isAlignLeft = true;
                widget.isAlignRight = true;
                widget.isAlignBottom = true;
                widget.isAlignTop = true;
                break;
        }
        widget.target = find("Canvas");
        widget.updateAlignment();
    }
    /** 移除 */
    removeAdaptater(node: Node) {
        if (node.getComponent(Widget)) {
            node.removeComponent(Widget);
        }
    }
}
