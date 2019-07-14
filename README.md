# 开发手册

主要是为了理清楚开发该网页的代码，方便后续开发。

## 简写变量

* **r** - root
* **d** - data
* **del** - delete
* **px/py** - 相对初始位置的平移量
* **dx/dy** - 相对父节点的坐标
* **x/y** -  相对根节点的坐标
* **dura** - duration

## JSON数据处理

* **isEqualJSON**(a, b) - 判断a，b数据是否完全一样
* **delJSON**(data, del) - 删除data中的del数据
* **addJSON**(data, dParent, d) - 在data中的dParent添加子数据d
* **insertJSON**(data, dPosition, d, i) - 往data中插入数据d，根据i的值插入在dPosition之前/之后
* **addIdJSON**(data, id) - 给数据data添加唯一标识id

## Outline绘制

* **drawOutline**(data) - 根据数据data绘制outline
* **shapePath**(d) - 连线生成器
* **appendNode**(enter) - 添加节点
* **updateNode**(update) - 更新节点
* **appendPath**(enter) - 添加连线
* **updatePath**(update) - 更新连线
* **draw**(r) - 处理数据r并分别绘制Node和Path

## Mindnode绘制

* **drawMindnode**(data) - 根据数据data绘制mindnode
* **draggedNodeRenew**(draggedNode, targetX, targetY, dura) - 更新draggedNode的位置，dura设定了动画过渡的时间
* **draggedNodeChildrenRenew**(d, px, py) - 更新数据d中的平移量px和py
* **clicked**() - node的点击事件：选中node
* **dragstarted**() - 拖拽开始时：选中node
* **dragged**() - 拖拽中：拖拽node
* **dragended**() - 拖拽结束时：更新node
* **appendNode**(enter) - 添加节点
* **updateNode**(update) - 更新节点
* **tree**(d) - 处理数据d，返回新数据
* **gNodeNest**(d, gParent) - 嵌套绘制Node和Path
* **renewY**(r, textWidth) - 根据textWidth更新数据y值
* **chart**(d) - 处理数据d并开始绘制
* **addTextWidth**(d) - 给数据d添加d.name在text中的宽度，方便后续绘制

## 仍待开发的功能

* mindnode和outline的联动
* outline的编辑节点名称