/* global d3 axios fontSize bar:true */
/* eslint no-param-reassign: ['error', { 'props': false }] */
function outline() {
  let root = null;
  const gOutline = d3.select('g#outline');
  const svgSize = {
    height: 0, width: 200,
  };
  const gOutNode = gOutline.append('g').attr('font-size', fontSize);
  const gOutPath = gOutline.append('g').attr('transform', `translate(${5},${bar.height / 2})`);

  function linkShape(d) {
    const x0 = d.source.x;
    const y0 = d.source.y;
    const x1 = d.target.x;
    const y1 = d.target.y;
    return `M${y0},${x0}V${x1 - 4}Q${y0} ${x1} ${y1} ${x1}`;
  }
  function appendNode(enter) {
    const gEnter = enter.append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${0},${d.x})`);
    gEnter.append('rect')
      .attr('height', bar.height)
      .attr('width', bar.width)
      .style('fill', 'rgb(239, 239, 239)');
    gEnter.append('text')
      .attr('dy', 20)
      .attr('dx', 14)
      .text(d => d.data.name)
      .attr('transform', d => `translate(${d.y},${0})`);
  }
  function updateNode(update) {

  }
  function appendLink(enter) {
    enter.append('path', 'g')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#555')
      .attr('d', linkShape);
  }
  function updateLink(update) {

  }
  function gNode(r) {
    const nodes = r.descendants();
    svgSize.height = nodes.length * (bar.height + 1);
    gOutline.attr('height', svgSize.height).attr('width', svgSize.width);
    let index = 0;
    r.eachBefore((n) => {
      n.x = index * (bar.height + 1);
      n.y = n.depth * 7;
      index += 1;
    });
    console.log(r.links());
    gOutNode.selectAll('g.node')
      .data(nodes)
      .join(
        enter => appendNode(enter),
        update => updateNode(update),
      );
    gOutPath.selectAll('path.link')
      .data(r.links())
      .join(
        enter => appendLink(enter),
        update => updateLink(update),
      );
  }
  axios.get('/data').then((res) => {
    const { data } = res;
    root = d3.hierarchy(data);
    gNode(root);
  });
}
outline();
