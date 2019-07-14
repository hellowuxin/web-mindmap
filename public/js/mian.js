/* global d3 axios:true */
/* eslint no-param-reassign: ['error', { 'props': false }] */
const fontSize = 14;
const transition = d3.transition().duration(2000).ease(d3.easePoly);

const svg = d3.select('svg');
const svgSize = { width: 1300, height: 650 };
svg.attr('width', svgSize.width).attr('height', svgSize.height).attr('font-size', fontSize);

const gOutline = d3.select('g#outline');
const gOutlineSize = { width: 200, height: 0 };
const gOutNode = gOutline.append('g');
const gOutPath = gOutline.append('g');
const outline = { rectFill: 'rgb(239, 239, 239)' };

const gMindnode = d3.select('g#mindnode');

function isEqualJSON(a, b) {
  // 局限性：
  // 如果对象里属性的位置发生变化，转换来的字符串就不相等，但实际我们只需要看他们的内容是否一致，与顺序没有关系，所以这种方法有局限性。
  const aStr = JSON.stringify(a);
  const bStr = JSON.stringify(b);
  if (aStr === bStr) {
    return true;
  }
  return false;
}
function delJSON(data, del) {
  const dChildren = data.children;
  if (dChildren) {
    for (let index = 0; index < dChildren.length; index += 1) {
      const dChild = dChildren[index];
      const bool = isEqualJSON(dChild, del);
      if (bool) {
        dChildren.splice(index, 1);
        return true;
      }
      if (delJSON(dChildren[index], del)) {
        return true;
      }
    }
  }
  return false;
}
function addJSON(data, dParent, d) {
  if (isEqualJSON(data, dParent)) {
    data.children.push(d);
    return true;
  }
  if (data.children) {
    for (let index = 0; index < data.children.length; index += 1) {
      const dataChildren = data.children[index];
      const bool = isEqualJSON(dataChildren, dParent);
      if (bool) {
        if (!dataChildren.children) {
          dataChildren.children = [];
        }
        dataChildren.children.push(d);
        return true;
      }
      if (addJSON(dataChildren, dParent, d)) {
        return true;
      }
    }
  }
  return false;
}
function insertJSON(data, dPosition, d, i) {
  const dataChildren = data.children;
  if (dataChildren) {
    for (let index = 0; index < dataChildren.length; index += 1) {
      const dataChild = dataChildren[index];
      if (isEqualJSON(dataChild, dPosition)) {
        dataChildren.splice(index + i, 0, d);
        return true;
      }
      insertJSON(dataChild, dPosition, d, i);
    }
  }
  return false;
}
function addIdJSON(data, id) {
  data.id = id;
  if (data.children) {
    for (let index = 0; index < data.children.length; index += 1) {
      addIdJSON(data.children[index], `${id}${index}`);
    }
  }
}

function drawOutline(data) {
  const nodeSize = { width: 250, height: 30 };
  function shapePath(d) {
    const x0 = d.source.x;
    const y0 = d.source.y;
    const x1 = d.target.x;
    const y1 = d.target.y;
    return `M${y0},${x0}V${x1 - 4}Q${y0} ${x1} ${y1} ${x1}`;
  }
  function appendNode(enter) {
    const gEnter = enter.append('g')
      .attr('transform', d => `translate(0,${d.x})`);
    gEnter.append('rect')
      .attr('width', nodeSize.width)
      .attr('height', nodeSize.height)
      .style('fill', outline.rectFill);
    gEnter.append('text')
      .attr('dy', nodeSize.height / 1.5)
      .attr('dx', fontSize)
      .text(d => d.data.name)
      .attr('transform', d => `translate(${d.y},${0})`);
  }
  function updateNode(update) {
    console.log(update.nodes());
  }
  function appendPath(enter) {
    enter.append('path', 'g')
      .attr('fill', 'none')
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 1.5)
      .attr('stroke', '#555')
      .attr('d', shapePath);
  }
  function updatePath(update) {
    console.log(update.nodes());
  }
  function draw(r) {
    let index = 0;
    r.eachBefore((n) => { // 深度优先遍历
      n.x = index * (nodeSize.height + 1);
      n.y = n.depth * 8;
      index += 1;
    });

    const rDescendants = r.descendants();
    gOutlineSize.height = rDescendants.length * (nodeSize.height + 1);
    gOutline.attr('height', gOutlineSize.height).attr('width', gOutlineSize.width);

    gOutNode.selectAll('g')
      .data(rDescendants)
      .join(
        enter => appendNode(enter),
        update => updateNode(update),
      );
    gOutPath.selectAll('path')
      .data(r.links())
      .join(
        enter => appendPath(enter),
        update => updatePath(update),
      );
  }
  draw(d3.hierarchy(data));
}
function drawMindnode(data) {
  let root = null;
  const link = d3.linkHorizontal().x(d => d[0]).y(d => d[1]);
  const nodeSize = { width: 250, height: 25 };
  gOutPath.attr('transform', `translate(${fontSize / 2},${nodeSize.height / 2})`);
  function draggedNodeRenew(draggedNode, targetX, targetY, dura) {
    const t = d3.transition().duration(dura).ease(d3.easePoly);
    d3.select(draggedNode).transition(t).attr('transform', `translate(${targetY},${targetX})`);
    // 更新draggedNode与父节点的path
    d3.select(draggedNode).each((d) => {
      d3.select(`path#path_${d.data.id}`).transition(t).attr('d', `${link({
        source: [-targetY + (d.parent ? d.parent.data.textWidth : 0), -targetX],
        target: [0, 0],
      })}L${d.data.textWidth},0`);
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
  function clicked() {
    d3.event.stopPropagation();// 阻止捕获和冒泡阶段中当前事件的进一步传播。
    const clickedNode = this;
    const selectedNode = document.getElementById('selectedNode');
    if (selectedNode) {
      if (!selectedNode.isSameNode(clickedNode)) {
        selectedNode.removeAttribute('id');
        clickedNode.setAttribute('id', 'selectedNode');
      }
    } else {
      clickedNode.setAttribute('id', 'selectedNode');
    }
  }
  function dragstarted() {
    const draggedNode = this;
    const selectedNode = document.getElementById('selectedNode');
    if (selectedNode) {
      if (!selectedNode.isSameNode(draggedNode)) {
        selectedNode.removeAttribute('id');
        draggedNode.setAttribute('id', 'selectedNode');
      }
    } else {
      draggedNode.setAttribute('id', 'selectedNode');
    }
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
    const gSelection = gMindnode.selectAll('g').filter((d, i, n) => !draggedNode.isSameNode(n[i]) && !draggedNode.parentNode.isSameNode(n[i]));
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
          if (!delJSON(root.data, draggedD.data)) {
            console.log('delJSON error!');
          }
          if (!addJSON(root.data, newParentD.data, draggedD.data)) {
            console.log('addJSON error!');
          } else {
            draggedNode.parentNode.removeChild(draggedNode);
            // eslint-disable-next-line no-use-before-define
            chart(root.data);
          }
        });
      });
    } else if (Math.abs(subject.px) > root.nodeHeight) { // 更新json数据顺序
      let draggedParentNode = draggedNode.parentNode;
      if (!draggedParentNode.isEqualNode(gMindnode.nodes()[0])) {
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
              delJSON(root.data, subject.data);
              if (a.b0) {
                insertJSON(root.data, a.b0, subject.data, 0);
                draggedNode.parentNode.insertBefore(draggedNode, a.n0);
              } else if (a.b1) {
                insertJSON(root.data, a.b1, subject.data, 1);
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
    gNode.append('text')
      .attr('class', d => `depth_${d.depth}`)
      .attr('dy', -5)
      .text(d => d.data.name)
      .clone(true)
      .lower()
      .attr('stroke', 'white')
      .attr('class', d => `depth_${d.depth} back`);
    gNode.append('rect')
      .attr('class', d => `depth_${d.depth}`)
      .attr('y', -17 - 4)
      .attr('x', -4)
      .attr('width', d => d.data.textWidth + 8)
      .attr('height', 16 + 8)
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('stroke', 'blue')
      .attr('fill', 'blue')
      .attr('stroke-width', 2)
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)
      .lower();
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
      .attr('d', d => `${link({
        source: [
          (d.parent ? d.parent.y + d.parent.data.textWidth : 0) - d.y,
          (d.parent ? d.parent.x : 0) - d.x,
        ],
        target: [0, 0],
      })}L${d.data.textWidth},0`);
    return gNode;
  }
  function updateNode(update) {
    update.attr('class', d => `depth_${d.depth}`)
      .transition(transition)
      .attr('transform', d => `translate(${d.dy},${d.dx})`);
    const updateNodes = update.nodes();
    update.each((d, i) => {
      d3.select(updateNodes[i]).select('rect')
        .attr('class', `depth_${d.depth}`);
      d3.select(updateNodes[i]).select('path')
        .attr('id', `path_${d.data.id}`)
        .attr('class', `depth_${d.depth}`)
        .transition(transition)
        .attr('d', `${link({
          source: [
            (d.parent ? d.parent.y + d.parent.data.textWidth : 0) - d.y,
            (d.parent ? d.parent.x : 0) - d.x,
          ],
          target: [0, 0],
        })}L${d.data.textWidth},0`);
    });
    return update;
  }
  function tree(d) {
    const r = d3.hierarchy(d);// 根据指定的分层数据构造根节点
    r.nodeHeight = nodeSize.height;
    r.nodeWidth = (svgSize.width - nodeSize.width) / (r.height + 1);// r.height与叶子节点的最大距离
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
    gNode.on('click', clicked).call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended));

    for (let index = 0; index < d.length; index += 1) {
      let dChildren = d[index].children;
      if (!dChildren) {
        dChildren = [];
      }
      gNodeNest(dChildren, gNode.filter((a, i) => i === index));
    }
  }
  function renewY(r, textWidth) {
    r.y += textWidth;
    if (r.children) {
      for (let index = 0; index < r.children.length; index += 1) {
        const rChild = r.children[index];
        renewY(rChild, textWidth + r.data.textWidth);
      }
    }
  }
  function chart(d) {
    addIdJSON(d, '0');
    root = tree(d);
    let x0 = Infinity;
    let x1 = -x0;
    renewY(root, 0);
    root.each((a) => {
      a.dx = a.x - (a.parent ? a.parent.x : 0);
      a.dy = a.y - (a.parent ? a.parent.y : 0);
      if (a.x > x1) x1 = a.x;// 求得最大，即最低点
      if (a.x < x0) x0 = a.x;// 求得最小，即最高点
    });
    gMindnode.attr('transform', `translate(${nodeSize.width + 20},${root.nodeHeight - x0})`);
    gNodeNest([root], gMindnode);
  }
  function addTextWidth(d) {
    const hiddenSvg = d3.select('g#hidden');
    const text = hiddenSvg.append('text').text(d.name).nodes()[0];
    d.textWidth = text.getBBox().width;
    if (d.children) {
      for (let index = 0; index < d.children.length; index += 1) {
        const dChild = d.children[index];
        addTextWidth(dChild);
      }
    }
  }
  addTextWidth(data);
  addIdJSON(data, '0');
  chart(data);
}

axios.get('/data').then((res) => {
  const { data } = res;
  drawOutline(data);
  drawMindnode(data);
});
