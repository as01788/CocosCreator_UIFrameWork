
import { _decorator, Component, Prefab, Texture2D, AudioClip, AnimationClip } from "cc";
import ResMgr from "../../ResMgr";

/**
 * 进入场景前 就必须加载的资源可以从这里加载
 */
const {ccclass, property} = _decorator;

@ccclass("ResHelper")
export default class ResHelper extends Component {

    @property([Prefab])
    prefabs: Prefab[] = [];

    @property({type: [Texture2D]})
    textures: Texture2D[] = [];

    @property({type: [AudioClip]})
    audioClips: Texture2D[] = [];

    @property([AnimationClip])
    animClips: AnimationClip[] = [];
    
    onLoad() {
        // onload 执行， 那么表示上面的数据都加载到了
        // 那么把这些资源放到resMsg中
        for(const pre of this.prefabs) {
            ResMgr.inst.addStub(pre, Prefab);
        }

        for(const texture of this.textures) {
            ResMgr.inst.addStub(texture, Texture2D);
        }

        for(const audioClip of this.audioClips) {
            ResMgr.inst.addStub(audioClip, AudioClip);
        }

        for(const animClip of this.animClips) {
            ResMgr.inst.addStub(animClip, AnimationClip);
        }
    }

    // update (dt) {}
}
