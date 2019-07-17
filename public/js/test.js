/* global axios:true */
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
class DataJSON {
  constructor(d) {
    this.data = d;
  }

  del(s, d = this.data) { // 删除d中的s
    for (let index = 0; d && index < d.length; index += 1) {
      const dChild = d[index];
      if (isEqualJSON(dChild, s)) {
        d.splice(index, 1);
        return true;
      }
      if (dChild.children) {
        if (this.del(s, dChild.children)) {
          return true;
        }
      }
    }
    return false;
  }

  add(dParent, d, data = this.data) {
    for (let index = 0; index < data.length; index += 1) {
      const dataChild = data[index];
      if (isEqualJSON(dataChild, dParent)) {
        if (!dataChild.children) {
          dataChild.children = [];
        }
        dataChild.children.push(d);
        return true;
      }
      if (dataChild.children) {
        if (this.add(dParent, d, dataChild.children)) {
          return true;
        }
      }
    }
    return false;
  }

  exchange(a, b, d = this.data) {
    
  }
}

axios.get('/data').then((res) => {
  const a = { name: '绑定数据' };
  const b = {
    name: '简单图形',
    children: [
      { name: '柱形图' },
      { name: '折线图' },
      { name: '散点图' }],
  };
  const data = new DataJSON([res.data]);
  data.del(a);
  data.add(b, a);
  console.log(data);
});
