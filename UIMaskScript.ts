
import UIManager from "./UIManager";
import { MaskOpacity } from "./config/SysDefine";
import CocosHelper from "./CocosHelper";
import { _decorator, Component, Texture2D, view, Button, Sprite, SpriteFrame, Color, tween, UITransform, UIOpacity, assetManager } from "cc";

/**
 * @Author: 邓朗 
 * @Describe: mask设置
 * @Date: 2019-05-30 23:35:26  
 * @Last Modified time: 2019-05-30 23:35:26 
 */
const {ccclass, property} = _decorator;

@ccclass("UIMaskScript")
export default class UIMaskScript extends Component {

    private uid: string;

    /** 代码创建一个单色texture */
    private _texture: Texture2D = null;
    private getSingleTexture() {
        if(this._texture) return this._texture;
        let data: any = new Uint8Array(2 * 2 * 4);
        for(let i=0; i<2; i++) {
            for(let j=0; j<2; j++) {
                data[i*2*4 + j*4+0] = 255;
                data[i*2*4 + j*4+1] = 255;
                data[i*2*4 + j*4+2] = 255;
                data[i*2*4 + j*4+3] = 255;
            }
        }
        let texture = new Texture2D();
        //TODO
        // texture.initWithData(data, Texture2D.PixelFormat.RGBA8888, 2, 2);
        // texture.handleLoadedTexture();
        this._texture = texture;
        return this._texture;
    }

    /**
     * 初始化
     */
    public init() {
        let maskTexture = this.getSingleTexture();
        let size = view.getVisibleSize();
        this.node.getComponent(UITransform).height = size.height;
        this.node.getComponent(UITransform).width = size.width;
        this.node.addComponent(Button);
        this.node.on('click', this.clickMaskWindow, this);
        
        let sprite = this.node.addComponent(Sprite)
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        //TODO
        // sprite.spriteFrame = new SpriteFrame(maskTexture);
        // sprite.spriteFrame = new SpriteFrame();
        // sprite.spriteFrame.texture = maskTexture;
        assetManager.loadAny({"uuid":"7d8f9b89-4fd1-4c9f-a3ab-38ec7cded7ca@f9941"},(err,asset)=>{
            sprite.spriteFrame=asset;
        }); 
        this.node.getComponent(Sprite).color = new Color(0, 0, 0);
        this.node.getComponent(UIOpacity).opacity = 0;
        this.node.active = true;
    }
    /** 使用 */
    reuse(uid: string) {
        this.uid = uid;
    }
    /** 释放 */
    unuse() {
        this.uid = "";
        this.node.getComponent(UIOpacity).opacity = 0;
        this.node.active = true;
        tween(this.node).stop();
    }
    // 
    public async showMaskUI(lucenyType: number, time: number = 0.6, isEasing: boolean = true) {
        let o = 0;
        switch (lucenyType) {
            case MaskOpacity.Pentrate:    
                this.node.active = false;
            break;        
            case MaskOpacity.Lucency:   
                o = 0;
            break;
            case MaskOpacity.ImPenetrable:    
                o = 63;
            break;
            case MaskOpacity.Translucence:   
                o = 126;
            break;
        }
        if(!this.node.active) return ;
        this.node.setSiblingIndex(0);
        if(isEasing) {
            // await CocosHelper.runSyncAction(this.node, fadeTo(time, o));
            await CocosHelper.runSyncTween(this.node.getComponent(UIOpacity),tween().to(time,{opacity:0}));
        }else {
            this.node.getComponent(UIOpacity).opacity = o;
        }
    }

    public async clickMaskWindow() {
        let com = UIManager.getInstance().getComponentByUid(this.uid);
        if(com && com.maskType.clickMaskClose) {
           await UIManager.getInstance().closeUIForm(this.uid);
        }
    }
}
