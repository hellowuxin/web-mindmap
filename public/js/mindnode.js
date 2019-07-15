/* global d3 :true */
/* eslint no-param-reassign: ['error', { 'props': false }] */
class Mindnode {
  // 创建和初始化一个由class创建的对象
  constructor(d, w) { // w：gMindnodeWidth
    this.data = d;
    this.nodeHeight = 25;
    this.width = w;
    this.chart();
  }

  tree() {
    const r = d3.hierarchy(this.data);// 根据指定的分层数据构造根节点
    r.nodeHeight = this.nodeHeight;
    r.nodeWidth = this.width / (r.height + 1);// r.height与叶子节点的最大距离
    // nodeSize设置了节点的大小（高宽)
    // 高指两个叶子节点的纵向距离，宽指两个节点的横向距离
    return d3.tree().nodeSize([r.nodeHeight, r.nodeWidth])(r);
  }

  chart() {
    // addIdJSON(this.data, '0');
    this.root = this.tree();
    let x0 = Infinity;
    let x1 = -x0;
    // renewY(this.root, 0);
    this.root.each((a) => {
      a.dx = a.x - (a.parent ? a.parent.x : 0);
      a.dy = a.y - (a.parent ? a.parent.y : 0);
      if (a.x > x1) x1 = a.x;// 求得最大，即最低点
      if (a.x < x0) x0 = a.x;// 求得最小，即最高点
    });
    // gMindnode.attr('transform', `translate(${gOutlineSize.width + 20},${this.nodeHeight - x0})`);
    // gNodeNest([this.root], gMindnode);
  }
}
const mindnode = new Mindnode(1, 300);
console.log(mindnode);
