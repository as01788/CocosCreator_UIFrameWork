import { Animation, AnimationClip, Asset, AssetManager, assetManager, Node, resources, Tween, tween } from "cc";
import { SysDefine } from "./config/SysDefine";
export class LoadProgress {
    public url: string;
    public completedCount: number;
    public totalCount: number;
    public item: any;
    public cb?: Function;
}

export default class CocosHelper {

    /** 加载进度 */
    public static loadProgress = new LoadProgress();

    /** 等待时间, 秒为单位 */
    public static sleep = function (time: number) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(true);
            }, time * 1000);
        });
    }

    /**
     * 
     * @param target 
     * @param repeat -1，表示永久执行
     * @param tweens 
     */
    public static async runRepeatTween(target: any, repeat: number, ...tweens: Tween<any>[]) {
        return new Promise((resolve, reject) => {
            let selfTween = tween(target);
            for (const tmpTween of tweens) {
                selfTween = selfTween.then(tmpTween);
            }
            if (repeat < 0) {
                tween(target).repeatForever(selfTween).start();
            } else {
                tween(target).repeat(repeat, selfTween).start();
            }
        });

    }
    /** 同步的tween */
    public static async runSyncTween(target: any, ...tweens: Tween<any>[]) {
        return new Promise((resolve, reject) => {
            let selfTween = tween(target);
            for (const tmpTween of tweens) {
                selfTween = selfTween.then(tmpTween);
            }
            selfTween.call(() => {
                resolve(null);
            }).start();
        });

    }

    /** 同步的动画 */
    public static async runSyncAnim(node: Node, animName?: string | number) {
        let anim = node.getComponent(Animation);
        if (!anim) return;
        let clip: AnimationClip = null;
        if (!animName) clip = anim.defaultClip;
        else {
            let clips = anim.clips;
            if (typeof (animName) === "number") {
                clip = clips[animName];
            } else if (typeof (animName) === "string") {
                for (let i = 0; i < clips.length; i++) {
                    if (clips[i].name === animName) {
                        clip = clips[i];
                        break;
                    }
                }
            }
        }
        if (!clip) return;
        await CocosHelper.sleep(clip.duration);
    }

    /** 加载资源 */
    public static loadRes<T extends Asset>(url: string, type: typeof Asset, progressCallback?: (completedCount: number, totalCount: number, item: any) => void): Promise<T> {
        if (!url || !type) {
            console.log("参数错误", url, type);
            return;
        }
        CocosHelper.loadProgress.url = url;
        if (progressCallback) {
            this.loadProgress.cb = progressCallback;
        }
        return new Promise((resolve, reject) => {
            resources.load(url, type, this._progressCallback, (err, asset: T) => {
                if (err) {
                    console.log(`${url} [资源加载] 错误 ${err}`);
                    resolve(null);
                } else {
                    resolve(asset);
                }
                // 加载完毕了，清理进度数据
                CocosHelper.loadProgress.url = '';
                CocosHelper.loadProgress.completedCount = 0;
                CocosHelper.loadProgress.totalCount = 0;
                CocosHelper.loadProgress.item = null;
                CocosHelper.loadProgress.cb = null;
            });
        });
    }
    public static loadResFromBundle<T extends Asset>(bundleName: string, url: string, type: typeof Asset, progressCallback?: (completedCount: number, totalCount: number, item: any) => void, isArray: boolean = false, isLog: boolean = true, options?: {
        version?: string,
        scriptAsyncLoading?: boolean,
        preset?: string,
        priority?: number,
        audioLoadMode?: number,
        onFileProgress?: (loaded: number, total: number) => void,
        maxConcurrency?: number,
        maxRequestsPerFrame?: number,
        maxRetryCount?: number,
        cacheEnabled?: boolean,
    }): Promise<T> {
        if (!bundleName || !url || !type) {
            isLog && console.log("参数错误", bundleName, url, type);
            return;
        }

        CocosHelper.loadProgress.url = url;
        if (progressCallback) {
            this.loadProgress.cb = progressCallback;
        }
        return new Promise((resolve, reject) => {
            let bundle = assetManager.getBundle(bundleName);
            try {
                if (!bundle) {
                    assetManager.loadBundle(bundleName, options, (err, asset: AssetManager.Bundle) => {
                        if (err) {
                            isLog && console.error(err);
                            resolve(null);
                            return;
                        }
                        if (asset) {
                            if (isArray) {
                                asset.loadDir(url, type, this._progressCallback, (err, assets: any) => {
                                    if (err) {
                                        isLog && console.log(`${url} [资源加载] 错误 ${err}`);
                                        resolve(null);
                                    } else {
                                        resolve(assets);
                                    }
                                    // 加载完毕了，清理进度数据
                                    CocosHelper.loadProgress.url = '';
                                    CocosHelper.loadProgress.completedCount = 0;
                                    CocosHelper.loadProgress.totalCount = 0;
                                    CocosHelper.loadProgress.item = null;
                                    CocosHelper.loadProgress.cb = null;
                                });
                            } else {
                                asset.load(url, type, this._progressCallback, (err, asset: T) => {
                                    if (err) {
                                        isLog && console.log(`${url} [资源加载] 错误 ${err}`);
                                        resolve(null);
                                    } else {
                                        resolve(asset);
                                    }
                                    // 加载完毕了，清理进度数据
                                    CocosHelper.loadProgress.url = '';
                                    CocosHelper.loadProgress.completedCount = 0;
                                    CocosHelper.loadProgress.totalCount = 0;
                                    CocosHelper.loadProgress.item = null;
                                    CocosHelper.loadProgress.cb = null;
                                });
                            }
                        } else {
                            isLog && console.error("加载bundle失败");
                        }
                    });
                } else {
                    if (isArray) {
                        bundle.loadDir(url, type, this._progressCallback, (err, assets: any) => {
                            if (err) {
                                isLog && console.log(`${url} [资源加载] 错误 ${err}`);
                                resolve(null);
                            } else {
                                resolve(assets);
                            }
                            // 加载完毕了，清理进度数据
                            CocosHelper.loadProgress.url = '';
                            CocosHelper.loadProgress.completedCount = 0;
                            CocosHelper.loadProgress.totalCount = 0;
                            CocosHelper.loadProgress.item = null;
                            CocosHelper.loadProgress.cb = null;
                        });
                    } else {
                        bundle.load(url, type, this._progressCallback, (err, asset: T) => {
                            if (err) {
                                isLog && console.log(`${url} [资源加载] 错误 ${err}`);
                                resolve(null);
                            } else {
                                resolve(asset as T);
                            }
                            // 加载完毕了，清理进度数据
                            CocosHelper.loadProgress.url = '';
                            CocosHelper.loadProgress.completedCount = 0;
                            CocosHelper.loadProgress.totalCount = 0;
                            CocosHelper.loadProgress.item = null;
                            CocosHelper.loadProgress.cb = null;
                        });
                    }
                }
            } catch (e) {
                isLog && console.error(e);
            }
        });
    }
    /** 
     * 加载进度
     * cb方法 其实目的是可以将loader方法的progress
     */
    private static _progressCallback(completedCount: number, totalCount: number, item: any) {
        CocosHelper.loadProgress.completedCount = completedCount;
        CocosHelper.loadProgress.totalCount = totalCount;
        CocosHelper.loadProgress.item = item;
        CocosHelper.loadProgress.cb && CocosHelper.loadProgress.cb(completedCount, totalCount, item);
    }
    /**
     * 寻找子节点
     */
    public static findChildInNode(nodeName: string, rootNode: Node): Node {
        if (rootNode.name == nodeName) {
            return rootNode;
        }

        for (let i = 0; i < rootNode.children.length; i++) {
            let node = this.findChildInNode(nodeName, rootNode.children[i]);
            if (node) {
                return node;
            }
        }
        return null;
    }

    /** 检测前缀是否符合绑定规范 */
    public static checkNodePrefix(name: string) {
        if (name[0] !== SysDefine.SYS_STANDARD_Prefix) {
            return false;
        }
        return true;
    }
    /** 检查后缀 */
    public static checkBindChildren(name: string) {
        if (name[name.length - 1] !== SysDefine.SYS_STANDARD_End) {
            return true;
        }
        return false;
    }
    /** 获得类型和name */
    public static getPrefixNames(name: string) {
        if (name === null) {
            return;
        }
        return name.split(SysDefine.SYS_STANDARD_Separator);
    }
    /** 获得Component的类名 */
    public static getComponentName(com: Function | any) {
        // console.log('开始反射类名',JSON.stringify(com));
        // console.log(com.name);
        let arr = com.name.match(/<.*>$/);
        if (arr && arr.length > 0) {
            return arr[0].slice(1, -1);
        }
        return com.name;
    }
}