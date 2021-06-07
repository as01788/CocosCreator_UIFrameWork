
import { _decorator, Component, AudioClip, js, find, sys, AudioSource } from "cc";
import CocosHelper from "./CocosHelper";
import { SysDefine } from "./config/SysDefine";

const { ccclass, property } = _decorator;

@ccclass("SoundMgr")
export default class SoundMgr extends Component {

    private audioCache: { [key: string]: AudioClip } = js.createMap();
    private audioSource: AudioSource;

    private static _Instance: SoundMgr = null;                     // 单例
    public static get inst(): SoundMgr {
        if (this._Instance == null) {
            this._Instance = find(SysDefine.SYS_UIROOT_NAME).addComponent<SoundMgr>(this);
            //this._Instance.node.addComponent(AudioSource);
        }
        return this._Instance;
    }

    onLoad() {
        let volume = this.getVolumeToLocal();
        if (volume) {
            this.volume = volume;
        } else {
            this.volume.musicVolume = 1;
            this.volume.effectVolume = 1;
        }
        // this.audioSource = this.node.getComponent(AudioSource);
        this.audioSource = this.node.addComponent(AudioSource);
        this.setVolumeToLocal();
    }
    /** volume */
    private volume: Volume = new Volume();
    getVolume() {
        return this.volume;
    }

    start() {

    }
    /**  */
    public setMusicVolume(musicVolume: number) {
        this.volume.musicVolume = musicVolume;
        this.setVolumeToLocal();
    }
    public setEffectVolume(effectVolume: number) {
        this.volume.effectVolume = effectVolume;
        this.setVolumeToLocal();
    }
    /** 播放背景音乐 */
    public async playBackGroundMusic(url: string) {
        if (!url || url === '') return;

        if (this.audioCache[url]) {
            // audioEngine.playMusic(this.audioCache[url], true);
            this.audioSource.clip = this.audioCache[url];
            this.audioSource.loop=true;
            this.audioSource.play();
            return;
        }
        let sound = await CocosHelper.loadRes<AudioClip>(url, AudioClip);
        this.audioCache[url] = sound;
        // audioEngine.playMusic(sound, true);
        this.audioSource.clip = sound;
        this.audioSource.loop=true;
        this.audioSource.play();
    }
    /** 播放音效 */
    public async playEffectMusic(url: string) {
        if (!url || url === '') return;

        if (this.audioCache[url]) {
            // audioEngine.playEffect(this.audioCache[url], true);
            this.audioSource.playOneShot(this.audioCache[url],this.volume.effectVolume);
            return;
        }
        let sound = await CocosHelper.loadRes<AudioClip>(url, AudioClip);
        this.audioCache[url] = sound;
        // audioEngine.playEffect(sound, false);
        this.audioSource.playOneShot(this.audioCache[url],this.volume.effectVolume);
    }

    /** 从本地读取 */
    private getVolumeToLocal() {
        let objStr = sys.localStorage.getItem("Volume_For_Creator");
        if (!objStr) {
            return null;
        }
        return JSON.parse(objStr);
    }
    /** 设置音量 */
    private setVolumeToLocal() {
        // audioEngine.setMusicVolume(this.volume.musicVolume);
        // audioEngine.setEffectsVolume(this.volume.effectVolume);
        this.audioSource.volume=this.volume.musicVolume;

        sys.localStorage.setItem("Volume_For_Creator", JSON.stringify(this.volume));
    }

    // update (dt) {}
}

class Volume {
    musicVolume: number;
    effectVolume: number;
}
