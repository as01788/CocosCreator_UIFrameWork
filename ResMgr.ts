/**
 * 资源加载, 针对的是Form
 * 首先将资源分为两类
 * 一种是在编辑器时将其拖上去图片, 这里将其称为静态图片, 
 * 一种是在代码中使用cc.loader加载的图片, 这里将其称为动态图片
 * 
 * 对于静态资源
 * 1, 加载  在加载prefab时, cocos会将其依赖的图片一并加载, 所有不需要我们担心
 * 2, 释放  这里采用的引用计数的管理方法, 只需要调用destoryForm即可
 */

import { _decorator, js, Asset, resources, assetManager, Prefab } from 'cc';
import CocosHelper from "./CocosHelper";
import UIBase from "./UIBase";
import { EventCenter } from "./EventCenter";

export default class ResMgr {
    private static instance: ResMgr = null;
    public static get inst() {
        if (this.instance === null) {
            this.instance = new ResMgr();
        }
        return this.instance;
    }
    /** 
     * 采用计数管理的办法, 管理form所依赖的资源
     */
    private staticDepends: { [key: string]: number } = js.createMap();
    private dynamicDepends: { [key: string]: Array<string> } = js.createMap();
    private tmpStaticDepends: Array<string> = [];
    private _stubRes: { [type: string]: { [name: string]: Asset } } = {};
    public addStub(res: Asset, type: typeof Asset) {
        let content = this._stubRes[type.name];
        if (!content) {
            content = this._stubRes[type.name] = {};
        }
        content[res.name] = res;
    }
    public getStubRes(resName: string, type: typeof Asset) {
        let content = this._stubRes[type.name];
        if (!content) {
            return null;
        }
        return content[resName];
    }
    private _addTmpStaticDepends(completedCount: number, totalCount: number, item: any) {
        this.tmpStaticDepends[this.tmpStaticDepends.length] = item.url;
        if (this.staticDepends[item.url]) {
            this.staticDepends[item.url]++;
        } else {
            this.staticDepends[item.url] = 1;
        }
    }
    private _clearTmpStaticDepends() {
        for (let s of this.tmpStaticDepends) {
            if (!this.staticDepends[s] || this.staticDepends[s] === 0) continue;
            this.staticDepends[s]--;
            if (this.staticDepends[s] === 0) {
                delete this.staticDepends[s];           // 这里不清理缓存
            }
        }
        this.tmpStaticDepends = [];
    }
    /** 加载窗体 */
    public async loadForm(formName: string) {
        let form = await CocosHelper.loadRes<Prefab>(formName, Prefab, this._addTmpStaticDepends.bind(this));

        this._clearTmpStaticDepends();
        let deps = assetManager.dependUtil.getDepsRecursively(formName);

        this.addStaticDepends(deps);

        return form;
    }
    /** 销毁窗体 */
    public destoryForm(com: UIBase) {
        if (!com) {
            console.log("只支持销毁继承了UIBase的窗体!");
            return;
        }
        EventCenter.targetOff(com);
        let deps = assetManager.dependUtil.getDepsRecursively(com.uid);
        this.removeStaticDepends(deps);
        com.node.destroy();
    }
    /** 静态资源的计数管理 */
    private addStaticDepends(deps: Array<string>) {
        for (let s of deps) {
            if (this.staticDepends[s]) {
                this.staticDepends[s] += 1;
            } else {
                this.staticDepends[s] = 1;
            }
        }
    }
    private removeStaticDepends(deps: Array<string>) {
        for (let s of deps) {
            if (!this.staticDepends[s] || this.staticDepends[s] === 0) continue;
            this.staticDepends[s]--;
            if (this.staticDepends[s] === 0) {
                //可以销毁
                resources.release(s);
                delete this.staticDepends[s];
            }
        }
    }
    /** 动态资源管理, 通过tag标记当前资源, 统一释放 */
    public async loadDynamicRes(url: string, type: typeof Asset, tag?: string) {
        let sources = await CocosHelper.loadRes<Asset>(url, type);
        if (!tag) tag = url;
        if (!this.dynamicDepends[tag]) {
            this.dynamicDepends[tag] = [];
        }
        this.dynamicDepends[tag].push(url);

        return sources;
    }
    /** 销毁动态资源  没有做引用计数的处理 */
    public destoryDynamicRes(tag: string) {
        if (!this.dynamicDepends[tag]) {       // 销毁
            return false;
        }
        for (const key in this.dynamicDepends) {
            // cc.loader.release(this.dynamicDepends[key]);
            resources.release(key);
        }
        return true;
    }

}
