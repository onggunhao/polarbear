var w = 962,
    h = 500,
    jnodes,
    jlinks,
    node,
    link,
    fill = d3.scale.category20(); 

var vis = d3.select("#chart")
  .append("svg:svg")
    .attr("width", w)
    .attr("height", h);

$(document).ready(function() {
  d3.json("retweet_network.json", function(json) {
    jnodes = json.nodes;
    jlinks = json.links;

    var force = d3.layout.force()
        .charge(-8)
        .linkDistance(15)
        .nodes(jnodes)
        .links(jlinks)
        .size([w, h])
        .start();

    var link = vis.selectAll("line.link")
        .data(jlinks)
      .enter().append("svg:line")
        .attr("class", "link")
        .style("stroke-width", function(d) { return Math.sqrt(d.value); })
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    

    var node = vis.selectAll("g.node")
        .data(jnodes)
      .enter().append("svg:circle")
        .attr("class", "node")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", 5)
        .style("fill", function(d) { if (d.group == "right") return "#d62728";
          else return "#1f77b4"; })
        .call(force.drag);

    vis.style("opacity", 1e-6)
      .transition()
        .duration(1000)
        .style("opacity", 1);

    force.on("tick", function(e) {
      var k = 6 * e.alpha;

      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
      

      // Move nodes to left or right based on group
      jnodes.forEach(function(o, i) {
        if (o.group == "right")
        {
          o.x += k;
        }
        else
        {
          o.x += -k;
        }
      });
      
      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    });
  });
});

$("input").click(function () {
  alert('Handler for input called.');
});
