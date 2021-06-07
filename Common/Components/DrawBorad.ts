
import { Component, EventTouch, ImageAsset, Node, Sprite, Texture2D, UITransform, v2, v3, _decorator } from "cc";
import DrawingBoard from "../Utils/DrawingBoard";

const {ccclass, property} = _decorator;

@ccclass("DrawBorad")
export default class DrawBorad extends Component {

    @property(Node)
    ndBroad: Node = null;

    private _drawingBroad: DrawingBoard = null;
    private _texture: Texture2D = new Texture2D();
    private _sprite: Sprite = null;

    private broadYMax = -1;         // 画板上边界最大值
    private broadXMin = -1;         // 画板左边界最小值
    private _touching = false;


    onLoad() {
        this._sprite = this.ndBroad.getComponent(Sprite);
        if(!this._sprite) {
            this.ndBroad.addComponent(Sprite);
        }
        this._drawingBroad = new DrawingBoard(this.ndBroad.getComponent(UITransform).width, this.ndBroad.getComponent(UITransform).height);
        this._drawingBroad.setColor(0, 0, 0, 255);
        this._touching = false;

        let worldPos = this.ndBroad.getComponent(UITransform).convertToWorldSpaceAR(v3(0, 0))
        this.broadYMax = worldPos.y + this.ndBroad.getComponent(UITransform).height/2 ;
        this.broadXMin = worldPos.x - this.ndBroad.getComponent(UITransform).width/2;

        this.ndBroad.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.ndBroad.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.ndBroad.on(Node.EventType.TOUCH_CANCEL, this.touchCancel, this);
        this.ndBroad.on(Node.EventType.TOUCH_END, this.touchEnd, this);

    }

    private touchStart(e: EventTouch) {
        if(this._touching) return ;
        this._touching = true;
        let worldPos = e.getLocation();

        this._drawingBroad.moveTo(worldPos.x-this.broadXMin, this.broadYMax - worldPos.y);
    }
    private touchMove(e: EventTouch) {
        if(!this._touching) return ;
        let worldPos = e.getLocation();

        this._drawingBroad.lineTo(worldPos.x-this.broadXMin, this.broadYMax - worldPos.y);
        //TODO
        // this._texture.initWithData(this._drawingBroad.getData(), Texture2D.PixelFormat.RGBA8888, this.ndBroad.width, this.ndBroad.height);
        // this._sprite.spriteFrame.setTexture(this._texture);
        
    }
    private touchCancel(e: EventTouch) {
        this._touching = false;
    }
    private touchEnd(e: EventTouch) {
        this._touching = false;
    }

    onDestroy() {
        this.ndBroad.off(Node.EventType.TOUCH_START, this.touchStart, this);
        this.ndBroad.off(Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.ndBroad.off(Node.EventType.TOUCH_CANCEL, this.touchCancel, this);
        this.ndBroad.off(Node.EventType.TOUCH_END, this.touchEnd, this);
    }

    setColor(r: number, g: number, b: number, a: number) {
        this._drawingBroad.setColor(r, g, b, a);
    }
    setLineWidth(width: number) {
        this._drawingBroad.setLineWidth(width);
    }
    setPen() {
        
    }
    setReaser() {
        
    }

    getTexture() {
        return this._texture;
    }


}
