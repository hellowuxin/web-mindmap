/* eslint no-param-reassign: ['error', { 'props': false }] */
function isEqualJSON(a, b) { // 判断a，b是否完全一致
  // 局限性：
  // 如果对象里属性的位置发生变化，转换来的字符串就不相等，但实际我们只需要看他们的内容是否一致，与顺序没有关系，所以这种方法有局限性。
  const aStr = JSON.stringify(a);
  const bStr = JSON.stringify(b);
  if (aStr === bStr) {
    return true;
  }
  return false;
}
// eslint-disable-next-line no-unused-vars
class DataJSON {
  constructor(d) {
    this.data = d;
  }

  addId(id = '', d = this.data) { // 添加唯一标识
    for (let index = 0; index < d.length; index += 1) {
      const dChild = d[index];
      dChild.id = `${id}${index}`;
      if (dChild.children) {
        this.addId(`${id}${index}`, dChild.children);
      }
    }
  }

  del(s, d = this.data) { // 删除s
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

  add(dParent, d, data = this.data) { // dParent添加子节点d
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

  exchange(a, b, d = this.data) { // 同一父节点下的a,b调换
    for (let index = 0; index < d.length; index += 1) {
      const dChildA = d[index];
      if (isEqualJSON(dChildA, a)) {
        for (let i = 0; i < d.length; i += 1) {
          const dChildB = d[i];
          if (isEqualJSON(dChildB, b)) {
            d[index] = dChildB;
            d[i] = dChildA;
          }
        }
        return true;
      }
      if (dChildA.children) {
        if (this.exchange(a, b, dChildA.children)) {
          return true;
        }
      }
    }
    return false;
  }

  insert(dPosition, d, i = 0, data = this.data) { // 把d插入到dPosition的前面(i=0)或者后面(i=1)
    for (let index = 0; index < data.length; index += 1) {
      const dataChild = data[index];
      if (isEqualJSON(dataChild, dPosition)) {
        data.splice(index + i, 0, d);
        return true;
      }
      if (dataChild.children) {
        if (this.insert(dPosition, d, i, dataChild.children)) {
          return true;
        }
      }
    }
    return false;
  }
}
