# 开发手册

主要是为了理清楚开发该网页的代码，方便后续开发。

## JSON数据处理

* <b>isEqualJSON</b>(a, b) - 判断a，b数据是否完全一样
* <b>delJSON</b>(data, del) - 删除data中的del数据
* <b>addJSON</b>(data, dParent, d) - 在data中的dParent添加子数据d
* <b>insertJSON</b>(data, dPosition, d, i) - 往data中插入数据d在dPosition[^之前]或者[^之后]
* <b>addIdJSON</b>

[^之前]:i=0
[^之后]:i=1

