import { UITransform } from "cc";
import { DragPlus } from "./DragPlus";
import { DragSlot } from "./DragSlot";

export class DragHelper {

    // private slots:DragSlot[]=[];
    private slots = new Map<number,DragSlot[]>();

    addSlot(slot:DragSlot){
        if(!slot)return;
        if(this.slots.has(slot.slotID)){
            this.slots.get(slot.slotID).push(slot);
        }else{
            this.slots.set(slot.slotID,[slot]);
        }
    }
    delSlot(slot:DragSlot){
        if(!slot)return;
        if(this.slots.has(slot.slotID)){
            let temps = this.slots.get(slot.slotID);
            let index = temps.indexOf(slot);
            index != -1 && temps.splice(index,1);
            this.slots.set(slot.slotID,temps);
        }
    }

    // switchSlotID(slot:DragSlot){

    // }

    DragEnd(item:DragPlus):boolean{
        let temp = false;
        if(item){
            let box = item.node.getComponent(UITransform).getBoundingBoxToWorld();
            
            if(item.slotIDs && item.slotIDs.length>0)
            item.slotIDs.forEach(id=>{
                if(this.slots.has(id)){
                    let temps = this.slots.get(id);
                    temps.forEach(slot=>{
                        let box2 = slot.node.getComponent(UITransform).getBoundingBoxToWorld();
                        if(box2.intersects(box)){
                            item.Slot?.Uninstall();
                            slot.Install(item);
                            temp = true;
                            return;
                        }
                    });
                }
                if(temp) return;
            });
        }   
        return temp;
    }

}

declare global{
    interface Window{
        DragHelper:DragHelper;
    }
}

window.DragHelper=new DragHelper();