
export default class Queue<T> {
    private count: number;
    private lowestCount: number;
    private items: any;
  
    constructor() {
      this.count = 0;
      this.lowestCount = 0;
      this.items = {};
    }
    
    /**
     * 入栈
     * @param element 
     */
    enqueue(element: T) {
      this.items[this.count] = element;
      this.count++;
    }
    
    /**
     * 出栈并移除
     */
    dequeue() {
      if (this.isEmpty()) {
        return undefined;
      }
      const result = this.items[this.lowestCount];
      delete this.items[this.lowestCount];
      this.lowestCount++;
      return result;
    }
    
    /**
     * 出栈不移除
     */
    peek() {
      if (this.isEmpty()) {
        return undefined;
      }
      return this.items[this.lowestCount];
    }
    
    /**
     * 是否为空
     */
    isEmpty() {
      return this.size() <= 0;
    }
  
    clear() {
      this.items = {};
      this.count = 0;
      this.lowestCount = 0;
    }
  
    /**
     * 大小
     */
    size() {
      return this.count - this.lowestCount;
    }
  
    toString() {
      if (this.isEmpty()) {
        return '';
      }
      let objString = `${this.items[this.lowestCount]}`;
      for (let i = this.lowestCount + 1; i < this.count; i++) {
        objString = `${objString},${this.items[i]}`;
      }
      return objString;
    }
  }
