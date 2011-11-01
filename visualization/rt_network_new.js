var w = 962,
    h = 500,
    jnodes,
    jlinks,
    node,
    link,
    force,
    fill = d3.scale.category20();

var nodeDict = {};

var hashTag = "";
var multi_foci = false;
var hover = false;

var vis = d3.select("#chart")
  .append("svg:svg")
    .attr("width", w)
    .attr("height", h);

$(document).ready(function() {
  d3.json("retweet_network.json", function(json) {
    jnodes = json.nodes;
    jlinks = json.links;


    force = d3.layout.force()
        .charge(-9)
        .linkDistance(15)
        .nodes(jnodes)
        .links(jlinks)
        .size([w, h])
        .start();

    link = vis.selectAll("line.link")
        .data(jlinks)
      .enter().append("svg:line")
        .attr("class", "link")
        .style("stroke-width", function(d) { return Math.sqrt(d.value); })
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    // Setup quick node dictionary
    for(var i = 0; i < jnodes.length; i++)
    {
      nodeDict[i] = new Array();
      jnodes[i].weight = 0;
    }

    // Iterate over nodes and links to create dictionary
    for(var n = 0; n < jnodes.length; n++)
    {
      for(var l = 0; l < jlinks.length; l++)
      {
        if(jnodes[n].index == jlinks[l].source.index)
        {
          nodeDict[n].push(jlinks[l].target.index);
          jnodes[n].weight++;
        }
        else if(jnodes[n].index == jlinks[l].target.index)
        {
          nodeDict[n].push(jlinks[l].source.index);
          jnodes[n].weight++;
        }
      }
    }

    node = vis.selectAll("g.node")
        .data(jnodes)
      .enter().append("svg:circle")
        .attr("class", "node")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", function(d) { if (d.weight < 4) return 4; else return d.weight; })
        .style("fill", function(d) {if (d.group == "right") return "#d62728";
          else return "#1f77b4"; })
        .on('mouseover', function (d) {
          // Grey nodes that are not connected
          var index = d.index;
          var connNodes = nodeDict[index];
          node.style("opacity", function(d) {
            if(connNodes.indexOf(d.index) == -1 && d.index != index)
              return 0.2;
            else
              return 1.0;
          })
          hover = true;
        })
        .on('mouseout', function (d) {
          // Restore original color
          node.style("opacity", 1.0)
          hover = false;
        })
        .call(force.drag);

    force.on("tick", tick);
    
    function tick (e) {
      var k = 6 * e.alpha;

      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      // Move nodes to left or right based on group
      if (multi_foci) {
        jnodes.forEach(function(o, i) {
          if (o.group == "right")
            o.x += k;
          else
            o.x += -k;
        });
      };

      // Update node opacity based on hash tag
      if (!hover)
      {
        node.style("opacity", function(d) {
          if(!matchHash(d.tags, hashTag))
            return 0.2;
          else
          {
            return 1.0;
          }
        });
      }
      
      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    }

  });

  // Toggle multiple foci
  $('input#foci').click(function () {
    if(multi_foci) multi_foci = false;
    else multi_foci = true;
    force.resume();
  });

  // Set hash value
  $('input#hash').keyup(function(e) {
    hashTag =$(this).val()
    force.resume();
  });


});

function matchHash(tags, tag)
{
  for(var i = 0; i < tags.length; i++)
  {
    if(tags[i].indexOf(tag) != -1)
      return true;
  }
  return false;
}
