
import { _decorator, Component, Enum, size, v2, UITransform, CCInteger } from "cc";
import { ScrollViewHelper, ScrollViewElementProxy } from "../../Common/Components/ScrollViewHelper";

/*
 * @Author: liuhandong
 * @Date: 2020-01-02 17:46:49
 */
const {ccclass, property} = _decorator;

enum RowDirection {
    LeftToRight,
    TopToBottom
}

@ccclass("GridScrollList")
export class GridScrollList extends Component {
    public allProxy : ScrollViewElementProxy[] = [];
    @property(ScrollViewHelper)
    public scrollHelper:ScrollViewHelper = null;
    @property({type:Enum(RowDirection)})
    private rowDirection:RowDirection = RowDirection.LeftToRight;
    @property(CCInteger)
    private colSpace : number = 10;
    @property(CCInteger)
    private rowSpace : number = 10;
    @property(CCInteger)
    private colCount : number = 3;
    @property(CCInteger)
    private margin : number = 10;

    public doLayout() {
        this._layoutItems();
    }

    private _layoutItems() {
        this.scrollHelper.clearData();
        let data = this.allProxy;
        let elemSize = data.length?data[0].region.size:size(0, 0);
        let xSpace = this.colSpace;
        let ySpace = this.rowSpace;
        let colCount = this.colCount;
        let viewSize = this.scrollHelper.scrollView.node.getComponent(UITransform).contentSize;
        if(this.rowDirection == RowDirection.TopToBottom) {
            let temp = viewSize.width;
            // viewSize.width = viewSize.height;
            // viewSize.height = temp;
            viewSize.set(viewSize.height,temp);
            temp = elemSize.width;
            elemSize.width = elemSize.height;
            elemSize.height = temp;
        }
        let yMargin = this.margin;
        let xMargin = (viewSize.width - (colCount * elemSize.width + (colCount - 1) * xSpace)) / 2;
        

        let x = xMargin;
        let y = - yMargin + ySpace + elemSize.height;
        let dy = -ySpace - elemSize.height;
        let dx = xSpace + elemSize.width;
        if(this.rowDirection == RowDirection.TopToBottom) {
            dy = ySpace + elemSize.height;
            dx = -xSpace - elemSize.width;
            y = yMargin - dy;
        }
        for(let i = 0; i < data.length; i++) {
            x += dx;
            if(i % colCount == 0) {
                y += dy;
                x = xMargin;
            }
            let proxy = data[i];
            if(this.rowDirection == RowDirection.LeftToRight) {
                proxy.region.origin = v2(x, y - elemSize.height);
            } else {
                proxy.region.origin = v2(y, x - elemSize.height);
            }
            this.scrollHelper.addData(proxy);
        }
        if(this.rowDirection == RowDirection.LeftToRight) {
            this.scrollHelper.scrollView.content.getComponent(UITransform).setContentSize(viewSize.width, -y + elemSize.height + yMargin);
        } else {
            this.scrollHelper.scrollView.content.getComponent(UITransform).setContentSize(y + elemSize.height + yMargin, viewSize.width);
        }
    }
}
