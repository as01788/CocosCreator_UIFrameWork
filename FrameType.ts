import { _decorator } from 'cc';
import { MaskOpacity } from "./config/SysDefine";

export class MaskType {
    public opacity: MaskOpacity = MaskOpacity.Pentrate;
    public clickMaskClose = false;      // 点击阴影关闭
    public isEasing = false;            // 缓动实现
    public easingTime = 0.3;            // 缓动时间

    /**
     * 
     * @param opacity 阴影类型
     * @param ClickMaskClose 点击关闭阴影
     * @param IsEasing 缓动实现
     * @param EasingTime 缓动时间
     */
    constructor(opacity = MaskOpacity.Pentrate, ClickMaskClose = false, IsEasing = false, EasingTime = 0.3) {
        this.opacity = opacity;
        this.clickMaskClose = ClickMaskClose;
        this.isEasing = IsEasing;
        this.easingTime = EasingTime;
    }
}
