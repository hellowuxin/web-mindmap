# 项目介绍

初衷是想实现一个跟[MindNode](https://mindnode.com)近似的网页思维导图mindmap

拖拽、删除、添加、编辑等功能都已得到相对粗糙的实现（[DEMO](https://www.5xin.xyz/mindnode.html)）

**本地运行**：下载本项目 + node express.js

# 开发手册

理清楚该网页的代码，方便后续开发。

## 简写变量

* **r** - root
* **d** - data
* **n** - NodeList
* **del** - delete
* **px/py** - 相对初始位置的平移量
* **dx/dy** - 相对父节点的坐标
* **x/y** -  相对根节点的坐标
* **dura** - duration
* **sele** - select

## DataJSON类

[DataJSON](https://github.com/hellowuxin/dataJSON)

## 辅助函数

* **drawHotkey**() - 
* **seleOutNode**(id) - 选中对应数据id的节点
* **seleMindNode**(g, id) - 递归查找并选中对应数据id的节点
* **drawHiddenText**(d) - 给数据d添加d.name在text中的宽度
* **traverse**(d) - 
* **checkEditFocus**() - 当正在编辑的节点不再focus时，根据数据更新图
* **keyboardSvg**(newJSON, sele) - 

## Outline绘制

* **drawOutline**(data) - 根据数据data绘制outline
* **shapePath**(d) - 连线生成器
* **clicked**() - 点击事件
* **appendNode**(enter) - 添加节点
* **updateNode**(update) - 更新节点
* **appendPath**(enter) - 添加连线
* **updatePath**(update) - 更新连线
* **draw**(r) - 处理数据r并分别绘制Node和Path

## Mindnode绘制

* **drawMindnode**(data) - 根据数据data绘制mindnode
* **draggedNodeRenew**(draggedNode, targetX, targetY, dura) - 更新draggedNode的位置，dura设定了动画过渡的时间
* **draggedNodeChildrenRenew**(d, px, py) - 更新数据d中的平移量px和py
* **dragback**(subject, draggedNode) - 
* **clicked**() - 
* **dragged**() - 拖拽中：拖拽node
* **dragended**() - 拖拽结束时：更新node
* **appendNode**(enter) - 添加节点
* **updateNode**(update) - 更新节点
* **tree**(d) - 处理数据d，返回新数据
* **gNodeNest**(d, gParent) - 嵌套绘制Node和Path
* **renewY**(r, textWidth) - 根据textWidth更新数据y值
* **chart**(d) - 处理数据d并开始绘制

## 仍待处理

* 面向过程转面向对象
* mindnode和outline的联动
* 如何区分dragStart 和 click
* 动画的顺滑过渡
* isEqualJSON
* 单元测试