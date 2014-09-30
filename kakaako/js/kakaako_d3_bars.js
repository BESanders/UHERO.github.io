var margin = {
  top: 10, 
  right: 10, 
  bottom: 10, 
  left:10 
}

var bar_x = d3.scale.ordinal();
var bar_y = d3.scale.linear();
var curr_prop = null

function tooltip_html(d) {
  prop_string = curr_prop ? curr_prop+ ": "+ d[curr_prop] +"<br/>": ""
  return "Tract: "+d.Tract+"<br/>"
    +""+d.County+"<br/>"
    +"Units: "+d.Total_units+"<br/>"
    +""+prop_string
    //"OnwerOccupied/REnterOccuped/Occupied/Vacant"  
}

tip = d3.tip().attr('class', 'd3-tip').html(tooltip_html);


function set_scale_ranges() {
  height = d3.select("#tract_data").style("height").slice(0,-2)
  width = d3.select("#tract_data").style("width").slice(0,-2)
  
  bar_x.rangeBands([margin.left, width-margin.right], .1)
  bar_y.range([height-margin.bottom, margin.top])  
}

function set_scale_domains(data, prop) {
  sorted_names = sorted_tract_names(data, prop)
  total_units_extent = extent_by(data, prop)
  bar_x.domain(sorted_names)
  bar_y.domain(total_units_extent)  
}

function sorted_tract_names(data, prop) {
  return data
    .sort(function(a,b) { return d3.ascending(+a[prop], +b[prop]) })
    .map(function(d) { return d.Tract })
}

function extent_by(data, prop) {
  return d3.extent(data, function(d) { return +d[prop] })
}

function create_bars(data) {
  svg = d3.select("#tract_data")
    .append("svg")
    .attr("height", height)
    .attr("width", width)
  
  svg.call(tip)
  
  bars = svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", function(d) { return "tract t"+tag_valid(d.Tract) })
      .attr("fill-opacity", ".3")
      .on("mouseover", function(d) { 
        d3.select(this).attr("fill-opacity", 1)
        tip.show(d)
      })
      .on("mouseout", function(d) { 
        svg.selectAll("rect").attr("fill-opacity", .3)
        tip.hide(d)
      })
      .on("click", function(d) { 
        console.log(d)
        select_tract_id(d.Tract)
      })
  
  draw_initial_bar_position()

}

function draw_initial_bar_position() {
  d3.selectAll("rect.tract")
    .attr("x", function(d) { return bar_x(d.Tract) })
    .attr("y", bar_y(0))
    .attr("height", 0)
    .attr("width", bar_x.rangeBand())
}

function full_scale_y(prop) {
  data = d3.selectAll("rect.tract").data()
  bar_y.domain(extent_by(data, prop))
  refresh_y(prop)
}

function units_scale_y(prop) {
  data = d3.selectAll("rect.tract").data()
  bar_y.domain(extent_by(data, "Total_units"))
  refresh_y(prop)  
}
function refresh_y(prop) {
  curr_prop = prop
  if (curr_tract_d) update_all_text()
  set_maps_to_prop(prop)
  d3.selectAll("rect.tract")
    .transition()
    .duration(1000)
    .attr("fill", "#555") //fill here to match prop eventually)
    .attr("y", function(d) { return bar_y(d[prop]) })
    .attr("height", function(d) { return bar_y(0) - bar_y(d[prop])})
}

function resort_x(prop) {
  var bars = d3.selectAll("rect.tract")
  bar_x.domain(sorted_tract_names(bars.data(), prop))
  bars
    .transition()
    .duration(1000)
    .attr("x", function(d) { return bar_x(d.Tract) })  
}

function draw_d3_bars(data) {
  set_scale_ranges();
  set_scale_domains(data, "Total_units")
  create_bars(data)
  refresh_y("Total_units")
  //add_temp_controls(data)
}