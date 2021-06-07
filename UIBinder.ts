//import Binder from "./Binder";

import { _decorator, Component, Node, js, Label, Button, Sprite, RichText, MotionStreak, Graphics, EditBox, ScrollView, ProgressBar, Slider, PageView } from 'cc';
import ButtonPlus from "../Common/Components/ButtonPlus";

const {ccclass, property} = _decorator;
@ccclass('UIBinder')
export default abstract class UIBinder extends Component {
    $collector!: string;
    _Nodes        : {[name: string]: Node} = js.createMap();
    _Labels       : {[name: string]: Label}   = js.createMap();
    _Buttons      : {[name: string]: Button}   = js.createMap();
    _Sprites      : {[name: string]: Sprite}   = js.createMap();
    _RichTexts    : {[name: string]: RichText}   = js.createMap();
    _MotionStreaks: {[name: string]: MotionStreak}   = js.createMap();
    _Graphicss    : {[name: string]: Graphics}   = js.createMap();
    _EditBoxs     : {[name: string]: EditBox}   = js.createMap();
    _ScrollViews  : {[name: string]: ScrollView}   = js.createMap();
    _ProgressBars : {[name: string]: ProgressBar}   = js.createMap();
    _Sliders      : {[name: string]: Slider}   = js.createMap();
    _ButtonPlus   : {[name: string]: ButtonPlus}   = js.createMap();
    _PageViews    : {[name: string]: PageView}   = js.createMap();
    // start () {
    // }
    // update (dt) {}
}

