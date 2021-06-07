
import CocosHelper from "./CocosHelper";
import UIBase from "./UIBase";
import { FormType } from "./config/SysDefine";
import { _decorator, Label, Prefab, instantiate, tween, v3 } from "cc";

const {ccclass, property} = _decorator;

@ccclass("TipsForm")
export default class TipsForm extends UIBase {
    @property(Label)
    tips: Label = null;

    formType = FormType.TopTips;


    public static async popUp(url: string, params: any) {
        let prefab = await CocosHelper.loadRes<Prefab>(url, Prefab);
        if(!prefab) return ;
        let node = instantiate(prefab);
        let com = node.getComponent(TipsForm);
        com.tips.string = params;
        // todo...
        await com.exitAnim();
    }
    // onLoad () {}

    start () {

    }

    async exitAnim() {
        // await CocosHelper.runSyncAction(this.node, moveBy(1.2, 0, 30));
        await CocosHelper.runSyncTween(this.node,
                tween().by(1.2,{position:v3(0,30,0)})
            );
        this.node.removeFromParent();
        this.node.destroy();
    }

    // update (dt) {}
}
