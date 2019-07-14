# 开发手册

主要是为了理清楚开发该网页的代码，方便后续开发。

## JSON数据处理

* **isEqualJSON**(a, b) - 判断a，b数据是否完全一样
* **delJSON**(data, del) - 删除data中的del数据
* **addJSON**(data, dParent, d) - 在data中的dParent添加子数据d
* **insertJSON**(data, dPosition, d, i) - 往data中插入数据d，根据i的值插入在dPosition之前/之后
* **addIdJSON**(data, id) - 给数据data添加唯一标识id

## Outline绘制

* **drawOutline**(data) - 根据数据data绘制outline
* **shapePath**(d) - 生成连线
* **appendNode**(enter) - 添加节点
* **updateNode**(update) - 更新节点
* **appendPath**(enter) - 添加连线