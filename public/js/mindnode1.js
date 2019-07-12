/* global d3 axios:true */
/* eslint no-param-reassign: ["error", { "props": false }] */
/*
  全局变量：
  data        ---json数据：name children
  root        ---树状图数据：children data depth dx dy height nodeHeight nodeWidth parent x y
  transition  ---过渡效果：duration ease
  link        ---path路径生成器：x y
  svg         ---可缩放矢量图形：width height viewbox
  viewbox     ---定义在SVG视口中的位置和尺寸：x y width height
  g           ---用来组合对象的容器：font-family font-size transform
  gTransform  ---g相对svg的位移：left top
----------------------------------------------------------------------------
  局部变量：
  r           ---root
  d           ---data
  n           ---NodeList
  t           ---transition
  del         ---delete
  px/py       ---相对初始位置的平移量
  dx/dy       ---相对父节点的坐标
  x/y         ---相对根节点的坐标
  subject     ---dragged subject
----------------------------------------------------------------------------
  function：
  draggedNodeRenew(draggedNode, targetX, targetY, dura)
              ---更新被拖拽的节点的状态
  draggedNodeChildrenRenew(d, px, py)
              ---更新被拖拽节点的子集中每个节点d的平移量(px,py)
  isEqualJson(a, b)
              ---比较a、b是否完全一样
  delJson(d, del)
              ---从d中删除del
  addJson(data, dParent, d)
              ---把d添加在dParent的children中，dParent被包含于data
  insertJson(data, dPosition, d, i)
              ---当i为0，把d插入到dPosition前面；当i为1，把d插入到dPosition后面，dPosition被包含于data
  dragstarted()
              ---拖拽开始时，记录相对父节点的坐标？？？提前准备好
  dragged()   ---
  dragended() ---
  appendNode(enter)
              ---添加圆点、文本、矩形框、连线
  updateNode(update)
              ---更新圆点、文本、矩形框、连线
  removeNode(exit)
              ---
  tree(data)  ---根据data创建新的树布局，返回树状图数据root
  gNodeNest(d)---根据数据d递归生成g
  chart(d)    ---处理原生的json数据并开始生成图
  addIdJSON(d, id)
              ---给数据加上唯一id
----------------------------------------------------------------------------
  html标签：
  path：id=path_xxx class=depth_x
----------------------------------------------------------------------------
  补充说明：
  1、由于d3.hierarchy生成的树状图是纵向的，为了改成横向，使x代表纵坐标，y代表横坐标
  2、svg中的标签顺序不能随意改变，由于selectAll，标签的顺序和data值存在关联
*/
let root = null;
const transition = d3.transition().duration(1000).ease(d3.easePoly);
const link = d3.linkHorizontal().x(d => d[0]).y(d => d[1]);
const svg = d3.select('svg');
const viewBox = {
  x: 0, y: 0, width: 1000, height: 0,
};
const g = svg.append('g').attr('font-family', 'sans-serif').attr('font-size', 10);
const gTransform = {
  left: 0, top: 0,
};
function draggedNodeRenew(draggedNode, targetX, targetY, dura) {
  const t = d3.transition().duration(dura).ease(d3.easePoly);
  d3.select(draggedNode).transition(t).attr('transform', `translate(${targetY},${targetX})`);
  // 更新draggedNode与父节点的path
  d3.select(draggedNode).each((d) => {
    d3.select(`path#path_${d.data.id}`).transition(t).attr('d', link({
      source: [-targetY, -targetX],
      target: [0, 0],
    }));
  });
}
function draggedNodeChildrenRenew(d, px, py) {
  d.px = px;
  d.py = py;
  if (d.children) {
    for (let index = 0; index < d.children.length; index += 1) {
      const dChild = d.children[index];
      draggedNodeChildrenRenew(dChild, px, py);
    }
  }
}
function isEqualJson(a, b) {
  // 局限性：
  // 如果对象里属性的位置发生变化，转换来的字符串就不相等，但实际我们只需要看他们的内容是否一致，与顺序没有关系，所以这种方法有局限性。
  const aStr = JSON.stringify(a);
  const bStr = JSON.stringify(b);
  if (aStr === bStr) {
    return true;
  }
  return false;
}
function delJson(d, del) {
  const dChildren = d.children;
  if (dChildren) {
    for (let index = 0; index < dChildren.length; index += 1) {
      const dChild = dChildren[index];
      const bool = isEqualJson(dChild, del);
      if (bool) {
        dChildren.splice(index, 1);
        return true;
      }
      if (delJson(dChildren[index], del)) {
        return true;
      }
    }
  }
  return false;
}
function addJson(data, dParent, d) {
  if (isEqualJson(data, dParent)) {
    data.children.push(d);
    return true;
  }
  if (data.children) {
    for (let index = 0; index < data.children.length; index += 1) {
      const dataChildren = data.children[index];
      const bool = isEqualJson(dataChildren, dParent);
      if (bool) {
        if (!dataChildren.children) {
          dataChildren.children = [];
        }
        dataChildren.children.push(d);
        return true;
      }
      if (addJson(dataChildren, dParent, d)) {
        return true;
      }
    }
  }
  return false;
}
function insertJson(data, dPosition, d, i) {
  const dataChildren = data.children;
  if (dataChildren) {
    for (let index = 0; index < dataChildren.length; index += 1) {
      const dataChild = dataChildren[index];
      if (isEqualJson(dataChild, dPosition)) {
        dataChildren.splice(index + i, 0, d);
        return true;
      }
      insertJson(dataChild, dPosition, d, i);
    }
  }
  return false;
}
function clicked() {
  d3.event.stopPropagation();// 阻止捕获和冒泡阶段中当前事件的进一步传播。
  const clickedNode = this;
  const selectedNode = document.getElementById('selectedNode');
  if (selectedNode) {
    selectedNode.removeAttribute('id');
  }
  clickedNode.setAttribute('id', 'selectedNode');
}
function dragstarted() {
  const draggedNode = this;
  const selectedNode = document.getElementById('selectedNode');
  if (selectedNode) {
    selectedNode.removeAttribute('id');
  }
  draggedNode.setAttribute('id', 'selectedNode');
}
function dragged() {
  const draggedNode = this;
  const { subject } = d3.event;
  const py = d3.event.x - subject.x;
  const px = d3.event.y - subject.y;
  draggedNodeChildrenRenew(subject, px, py);
  // 相对subject.parent的坐标
  const targetY = subject.dy + py;
  const targetX = subject.dx + px;
  draggedNodeRenew(draggedNode, targetX, targetY, 0);
  // 重叠触发矩形边框
  const gSelection = g.selectAll('g')
    .filter((d, i, n) => !draggedNode.isSameNode(n[i]) && !draggedNode.parentNode.isSameNode(n[i]));
  gSelection.each((d, i, n) => {
    const gNode = n[i];
    const gRect = gNode.getElementsByTagName('rect')[0];
    const rect = { // 各个gRect相对subject.parent的坐标，以及gRect的宽高
      y: parseInt(gRect.getAttribute('x'), 10) + d.y + (d.py ? d.py : 0) - (subject.parent ? subject.parent.y : 0),
      x: parseInt(gRect.getAttribute('y'), 10) + d.x + (d.px ? d.px : 0) - (subject.parent ? subject.parent.x : 0),
      width: parseInt(gRect.getAttribute('width'), 10),
      height: parseInt(gRect.getAttribute('height'), 10),
    };
    if ((targetY > rect.y) && (targetY < rect.y + rect.width)
    && (targetX > rect.x) && (targetX < rect.x + rect.height)) {
      gNode.setAttribute('id', 'newParentNode');
      gRect.setAttribute('stroke-opacity', 0.2);
    } else {
      gNode.removeAttribute('id');
      gRect.setAttribute('stroke-opacity', 0);
    }
  });
}
function dragended() {
  const draggedNode = this;
  const { subject } = d3.event;
  // 新的父节点
  const newParentNode = document.getElementById('newParentNode');
  if (newParentNode) { // 更新json数据data
    newParentNode.removeAttribute('id');
    newParentNode.getElementsByTagName('rect')[0].setAttribute('stroke-opacity', 0);
    d3.select(draggedNode).each((draggedD) => {
      d3.select(newParentNode).each((newParentD) => {
        if (!delJson(root.data, draggedD.data)) {
          console.log('delJson error!');
        }
        if (!addJson(root.data, newParentD.data, draggedD.data)) {
          console.log('addJson error!');
        } else {
          draggedNode.parentNode.removeChild(draggedNode);
          // eslint-disable-next-line no-use-before-define
          chart(root.data);
        }
      });
    });
  } else if (Math.abs(subject.px) > root.nodeHeight) { // 更新json数据顺序
    let draggedParentNode = draggedNode.parentNode;
    if (!draggedParentNode.isEqualNode(g.nodes()[0])) {
      draggedParentNode = d3.select(draggedParentNode);
      draggedParentNode.each((d) => {
        const draggedBrotherNodes = draggedParentNode.selectAll(`g.depth_${d.depth + 1}`).filter((a, i, n) => !draggedNode.isSameNode(n[i]));
        if (draggedBrotherNodes) { // 不为空时
          const a = {
            x0: Infinity,
            x1: -Infinity,
          };
          draggedBrotherNodes.each((b, i, n) => {
            if (b.x > subject.x && b.x > a.x1 && b.x < (subject.x + subject.px)) {
              a.x1 = b.x;
              a.b1 = b.data;// 前兄弟节点
              a.n1 = n[i];
            }
            if (b.x < subject.x && b.x < a.x0 && b.x > (subject.x + subject.px)) {
              a.x0 = b.x;
              a.b0 = b.data;// 后兄弟节点
              a.n0 = n[i];
            }
          });
          if (a.b0 || a.b1) {
            delJson(root.data, subject.data);
            if (a.b0) {
              insertJson(root.data, a.b0, subject.data, 0);
              draggedNode.parentNode.insertBefore(draggedNode, a.n0);
            } else if (a.b1) {
              insertJson(root.data, a.b1, subject.data, 1);
              draggedNode.parentNode.insertBefore(draggedNode, a.n1.nextSibling);
            }
            // eslint-disable-next-line no-use-before-define
            chart(root.data);
          } else {
            draggedNodeChildrenRenew(subject, 0, 0);
            draggedNodeRenew(draggedNode, subject.dx, subject.dy, 1000);
          }
        } else {
          draggedNodeChildrenRenew(subject, 0, 0);
          draggedNodeRenew(draggedNode, subject.dx, subject.dy, 1000);
        }
      });
    } else {
      draggedNodeChildrenRenew(subject, 0, 0);
      draggedNodeRenew(draggedNode, subject.dx, subject.dy, 1000);
    }
  } else { // 复原
    draggedNodeChildrenRenew(subject, 0, 0);
    draggedNodeRenew(draggedNode, subject.dx, subject.dy, 1000);
  }
}
function appendNode(enter) {
  const gNode = enter.append('g');
  gNode.attr('class', d => `depth_${d.depth}`)
    .attr('stroke-linejoin', 'round')
    .attr('stroke-width', 3)
    .transition(transition)
    .attr('transform', d => `translate(${d.dy},${d.dx})`);
  gNode.append('circle')
    .attr('fill', d => (d.children ? '#555' : '#999'))
    .attr('r', 2.5);
  let gNodeText = gNode.append('text')
    .attr('class', d => `depth_${d.depth}`)
    .attr('dy', '0.31em')
    .attr('x', d => (d.children ? -6 : 6))
    .attr('text-anchor', d => (d.children ? 'end' : 'start'))
    .text(d => d.data.name)
    .clone(true)
    .lower()
    .attr('stroke', 'white')
    .attr('class', d => `depth_${d.depth} back`);
  gNodeText = gNodeText.nodes();
  gNode.append('rect')
    .attr('class', d => `depth_${d.depth}`)
    .attr('x', (d, i) => (gNodeText[i] ? (gNodeText[i].getBBox().x - 3) : (gNodeText[0].getBBox().x - 3)))
    .attr('y', (d, i) => (gNodeText[i] ? (gNodeText[i].getBBox().y - 2.5) : (gNodeText[0].getBBox().y - 2.5)))
    .attr('width', (d, i) => (gNodeText[i] ? (gNodeText[i].getBBox().width + 6) : (gNodeText[0].getBBox().width + 6)))
    .attr('height', (d, i) => (gNodeText[i] ? (gNodeText[i].getBBox().height + 5) : (gNodeText[0].getBBox().height + 5)))
    .attr('rx', 2)
    .attr('ry', 2)
    .attr('stroke', 'blue')
    .attr('fill', 'blue')
    .attr('stroke-width', 1.5)
    .attr('fill-opacity', 0)
    .attr('stroke-opacity', 0)
    .lower();
  // 生成连线
  gNode.append('path')
    .attr('id', d => `path_${d.data.id}`)
    .attr('class', d => `depth_${d.depth}`)
    .attr('fill', 'none')
    .attr('stroke', '#555')
    .attr('stroke-opacity', 0.4)
    .attr('stroke-width', 1.5)
    .attr('d', link({
      source: [0, 0],
      target: [0, 0],
    }))
    .lower()
    .transition(transition)
    .attr('d', d => link({
      source: [(d.parent ? d.parent.y : 0) - d.y, (d.parent ? d.parent.x : 0) - d.x],
      target: [0, 0],
    }));
  return gNode;
}
function updateNode(update) {
  update.attr('class', d => `depth_${d.depth}`)
    .transition(transition)
    .attr('transform', d => `translate(${d.dy},${d.dx})`);
  const updateNodes = update.nodes();
  update.each((d, i) => {
    d3.select(updateNodes[i]).select('circle')
      .attr('fill', (d.children ? '#555' : '#999'));
    const updateNodeText = d3.select(updateNodes[i]).selectAll(`text.depth_${d.depth}`)
      .text(d.data.name)
      .attr('class', (a, c) => `depth_${d.depth} ${c === 0 ? 'back' : ''}`)
      .attr('x', (d.children ? -6 : 6))
      .attr('text-anchor', (d.children ? 'end' : 'start'))
      .nodes();
    d3.select(updateNodes[i]).select('rect')
      .attr('class', `depth_${d.depth}`)
      .attr('x', updateNodeText[0].getBBox().x - 3)
      .attr('width', (updateNodeText[0].getBBox().width + 6));
    d3.select(updateNodes[i]).select('path')
      .attr('id', `path_${d.data.id}`)
      .attr('class', `depth_${d.depth}`)
      .transition(transition)
      .attr('d', link({
        source: [(d.parent ? d.parent.y : 0) - d.y, (d.parent ? d.parent.x : 0) - d.x],
        target: [0, 0],
      }));
  });
  return update;
}
function tree(d) {
  const r = d3.hierarchy(d);// 根据指定的分层数据构造根节点
  r.nodeHeight = 20;
  r.nodeWidth = viewBox.width / (r.height + 1);// r.height与叶子节点的最大距离
  // nodeSize设置了节点的大小（高宽)
  // 高指两个叶子节点的纵向距离，宽指两个节点的横向距离
  return d3.tree().nodeSize([r.nodeHeight, r.nodeWidth])(r);
}
function gNodeNest(d, gParent) {
  const gNode = gParent.selectAll(`g${d[0] ? `.depth_${d[0].depth}` : ''}`)
    .data(d)
    .join(
      enter => appendNode(enter),
      update => updateNode(update),
    );
  gNode.on('click', clicked)
    .call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended));

  for (let index = 0; index < d.length; index += 1) {
    let dChildren = d[index].children;
    if (!dChildren) {
      dChildren = [];
    }
    gNodeNest(dChildren, gNode.filter((a, i) => i === index));
  }
}
function addIdJSON(d, id) {
  d.id = id;
  if (d.children) {
    for (let index = 0; index < d.children.length; index += 1) {
      addIdJSON(d.children[index], `${id}${index}`);
    }
  }
}
function chart(d) {
  addIdJSON(d, '0');
  root = tree(d);
  let x0 = Infinity;
  let x1 = -x0;
  root.each((a) => {
    a.dx = a.x - (a.parent ? a.parent.x : 0);
    a.dy = a.y - (a.parent ? a.parent.y : 0);
    if (a.x > x1) x1 = a.x;// 求得最大，即最低点
    if (a.x < x0) x0 = a.x;// 求得最小，即最高点
  });
  viewBox.height = x1 - x0 + root.nodeHeight * 2;
  // viewBox属性允许指定一个给定的一组图形伸展以适应特定的容器元素。
  // width, height参数代表了缩放比例
  svg.attr('viewBox', [0, 0, viewBox.width, viewBox.height]);
  gTransform.left = root.nodeWidth / 3;
  gTransform.top = root.nodeHeight - x0;
  g.attr('transform', `translate(${gTransform.left},${gTransform.top})`);
  gNodeNest([root], g);
}
axios.get('/data').then((res) => {
  const { data } = res;
  addIdJSON(data, '0');
  chart(data);
});
