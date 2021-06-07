
import { _decorator, Button, Component, url, EventHandler, EventTouch } from "cc";
import { EDITOR } from "cc/env";
import SoundMgr from "../../SoundMgr";

const {ccclass, property, executeInEditMode, menu, help, inspector} = _decorator;
@ccclass("ButtonPlus")
@menu('i18n:MAIN_MENU.component.ui/Button')
@executeInEditMode
@help('i18n:COMPONENT.help_url.button')
@inspector('packages://buttonplus/inspector.js')
export default class ButtonPlus extends Button {

    @property({tooltip:"音效路径", type: '', multiline: true, formerlySerializedAs: '_N$string'})
    audioUrl = '';
    @property({tooltip: "屏蔽连续点击"})
    openContinuous = true;
    @property({tooltip:"屏蔽时间, 单位:秒"})
    continuousTime = 1;

    // false表示可以点击
    continuous: boolean = false;
    // 定时器
    _continuousTimer = null;
    

    // 长按触发
    @property({tooltip: "是否开启长按事件"})
    openLongPress = false;
    // 触发时间
    @property({tooltip: "长按时间"})
    longPressTime = 1;
    longPressFlag = false;

    private longPressTimer = null;
    
    onEnable() {
        this.continuous = false;
        super.onEnable();
        if (!EDITOR) {
        }
    }
    onDisable() {
        if (this._continuousTimer) {
            clearTimeout(this._continuousTimer);
            this._continuousTimer = null;
        }
        if(this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        super.onDisable();
    }

    /** 重写 */
    _onTouchBegan (event:EventTouch) {
        if (!this.interactable || !this.enabledInHierarchy) return;
 
        if(this.openLongPress && !this.longPressFlag) {    // 开启长按
            if(this.longPressTimer) clearTimeout(this.longPressTimer);
            this.longPressTimer = setTimeout(function() {
                // 还在触摸中 触发事件
                if(this["_pressed"]) {
                    this.node.emit('longclickStart', this);
                    this.longPressFlag = true;
                }
            }.bind(this), this.longPressTime * 1000);
        }

        this["_pressed"] = true;
        this["_updateState"]();
        // event.stopPropagation();
        event.propagationStopped=true;
    }
    _onTouchEnded(event) {
        if (!this.interactable || !this.enabledInHierarchy) return;
        if(this["_pressed"] && this.longPressFlag) {
            this.node.emit('longclickEnd', this);
            this.longPressFlag = false;
        } else if (this["_pressed"] && !this.continuous) {
            this.continuous = this.openContinuous ? true : false;
            EventHandler.emitEvents(this.clickEvents, event);
            this.node.emit('click', event);
            // SoundMgr.inst.playEffectMusic(this.audioUrl ? url.raw(this.audioUrl): null)
            SoundMgr.inst.playEffectMusic(this.audioUrl);
            if (this.openContinuous) {
               this._continuousTimer = setTimeout(function(){
                    this.continuous = false;
                }.bind(this), this.continuousTime * 1000);
            }
        }
        this["_pressed"] = false;
        this["_updateState"]();
        // event.stopPropagation();
        event.propagationStopped=true;
    }
    _onTouchCancel () {
        if (!this.interactable || !this.enabledInHierarchy) return;
        if(this["_pressed"] && this.longPressFlag) {
            this.node.emit('longclickEnd', this);
            this.longPressFlag = false;
        }
        this["_pressed"] = false;
        this["_updateState"]();
    }
    /** 添加点击事件 */
    addClick(callback: Function, target: Object) {
        this.node.off('click');
        this.node.on('click', callback, target);
    }
    /** 添加一个长按事件 */
    addLongClick(startFunc: Function, endFunc: Function, target: Object) {
        this.node.off('longclickStart');
        this.node.off('longclickEnd');
        this.node.on('longclickStart', startFunc, target);
        this.node.on('longclickEnd', endFunc, target);
    }
}
