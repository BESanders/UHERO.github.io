---
---
csv_data_a = []
csv_headers = {}
window.ts_annual = {}
ts_by_category = {}

start_date = 2004
end_date = 2013
all_dates = []

series_height = 45;

#---- Line Chart variables ---------

line_chart_scales = 
  x: d3.scale.ordinal().domain(num for num in [start_date..end_date])
  y_left: d3.scale.linear()
  y_right: d3.scale.linear()

time_axis = d3.svg.axis().scale(line_chart_scales.x)
left_axis = d3.svg.axis().scale(line_chart_scales.y_left).orient("left")
right_axis = d3.svg.axis().scale(line_chart_scales.y_right).orient("right")

dummy_path = d3.svg.line()
  .x((d,i) -> line_chart_scales.x(start_date+i))
  .y(0)

path_left = d3.svg.line()
  .x((d) -> line_chart_scales.x(+d.period))
  .y((d) -> line_chart_scales.y_left(d.val))

path_right = d3.svg.line()
.x((d) -> line_chart_scales.x(+d.period))
.y((d) -> line_chart_scales.y_right(d.val))

# ------------------------------------

x = d3.scale.linear().clamp(true).range([ 0, 145 ])
y = d3.scale.linear().range([ series_height, 5 ])

# y_growth = d3.scale.linear().range([ 5, series_height ]).domain([ 10, -10 ])
#
# cy_spark = (d) ->
#   cy = d.scaled_data[point]
#   (if cy is null then -10 else cy)

spark_line = d3.svg.line()
  .x((d, i) -> x i)
  .y((d) -> d)
  .defined((d) -> d isnt null)

spark_area_path = d3.svg.area()
  .x((d, i) -> x i)
  .y1((d) -> d)
  .y0(series_height)
  .defined((d) -> d isnt null)


window.data_categories = 
  "major indicators": { width: 130 }
  "visitor industry": { width: 140 }
  "labor": { width: 100 }
  "personal income": { width: 120 }
  "construction": { width: 100 }
  "county revenue": { width: 120 }  

set_up_nav = () ->
  d3.select("div#nav")
    .selectAll("div.nav_link")
    .data(d3.entries(data_categories))
    .enter()
    .append("div")
    .attr("class", "nav_link")
    .attr("id", (d) -> d.key.replace(" ", "_"))
    .style("width", (d) -> d.value.width+"px")
    .text((d) -> d.key)

set_headline = (text) ->
  d3.select("#headline").text(text)

set_up_dashboard_elements = (elements) ->
  set_up_div elem for elem in elements

set_up_div = (elem) ->
  d3.select("#chart_area")
    .append("div")
    .attr("class", "dashboard_element")
    .attr("id", elem.id)
    .style("width", elem.width+"px")
    .style("height", elem.height+"px")
    .call(elem.type_function)
 
set_up_svg = (container) ->
  width = +container.style("width").slice(0,-2)
  height = +container.style("height").slice(0,-2)
  container
    .append("svg")
    .attr("id", container.attr("id")+"_svg")
    .attr("height", height)
    .attr("width", width)

series_to_class = (series_name) ->
  series_name.replace(".","_").replace("@","_").replace("%","pct")

chart_extent = (array) ->
  full_extent = d3.extent(array)
  range = full_extent[1] - full_extent[0]
  [
    full_extent[0] - range*.1
    full_extent[1] + range*.1
  ]

get_data_in_chart_view = (series_name)->
  ts_annual[series_name].data.filter((d) -> +d.period <= end_date and +d.period >= start_date)

get_series_extent = (series_data)->
  chart_extent(series_data.map((d) -> +d.val))

combine_extent = (ex1, ex2) ->
  [ d3.min([ex1[0],ex2[0]]), d3.max([ex1[1],ex2[1]]) ]

window.update_domain_left = (series_datas) ->
  return [0,1] if series_datas.length == 0
  all_data = []
  all_data = all_data.concat(series) for series in series_datas
  line_chart_scales.y_left.domain(get_series_extent(all_data))

window.update_domain_right = (series_datas) ->
  return [0,1] if series_datas.length == 0
  all_data = []
  all_data = all_data.concat(series) for series in series_datas
  line_chart_scales.y_right.domain(get_series_extent(all_data))

window.add_to_line_chart_left_axis = (series) ->
  duration = 500
  chart_area = d3.select("g#chart_area")
  data = get_data_in_chart_view(series)
  domain = get_series_extent(data)  
  cur_domain = line_chart_scales.y_left.domain()

  unless chart_area.selectAll("path.s_left").empty()
    domain = combine_extent(cur_domain, domain)

  line_chart_scales.y_left.domain(domain).nice()

  d3.select("#left_axis")
    .transition()
    .duration(duration)
    .call(left_axis)

  chart_area.append("path")
    .datum(data)
    .attr("id", "s_left_#{series_to_class(series)}")
    .attr("class", "s_left line_chart_path")
    .attr("stroke", "#777")
    .attr("d", dummy_path)

  chart_area.selectAll("path.s_left")
    .transition()
    .duration(duration)
    .attr("d", path_left)

  toggle_left_axis_button(series)

add_to_line_chart_right_axis = (series) ->
  console.log("sending to right")

  duration = 500
  chart_area = d3.select("g#chart_area")
  data = get_data_in_chart_view(series)
  domain = get_series_extent(data)  
  cur_domain = line_chart_scales.y_right.domain()

  unless chart_area.selectAll("path.s_right").empty()
    domain = combine_extent(cur_domain, domain)

  line_chart_scales.y_right.domain(domain).nice()

  d3.select("#right_axis")
    .transition()
    .duration(duration)
    .call(right_axis)

  chart_area.append("path")
    .datum(data)
    .attr("id", "s_right_#{series_to_class(series)}")
    .attr("class", "s_right line_chart_path")
    .attr("stroke", "#BBB")
    .attr("d", dummy_path)

  chart_area.selectAll("path.s_right")
    .transition()
    .duration(duration)
    .attr("d", path_right)

  toggle_right_axis_button(series)



window.remove_from_line_chart_left_axis = (series) ->
  duration = 500
  chart_area = d3.select("g#chart_area")  
  d3.select("#s_left_#{series_to_class(series)}").remove()

  update_domain_left(chart_area.selectAll(".s_left").data())

  d3.select("#left_axis")
    .transition()
    .duration(duration)
    .call(left_axis)

  chart_area.selectAll("path.s_left")
    .transition()
    .duration(duration)
    .attr("d", path_left)

  toggle_left_axis_button(series)

remove_from_line_chart_right_axis = (series) ->
  console.log("removing_from_right")
  
  duration = 500
  chart_area = d3.select("g#chart_area")  
  d3.select("#s_right_#{series_to_class(series)}").remove()

  update_domain_right(chart_area.selectAll(".s_right").data())

  d3.select("#right_axis")
    .transition()
    .duration(duration)
    .call(right_axis)

  chart_area.selectAll("path.s_right")
    .transition()
    .duration(duration)
    .attr("d", path_right)

  toggle_right_axis_button(series)

add_to_pie = (series) ->
  console.log("sending to right")

remove_from_pie = (series) ->
  console.log("removing from left")
	

visitor_line_chart = (container) ->
  svg = set_up_svg(container)
  margin = 
    top: 10
    bottom: 25
    left: 50
    right: 50

  chart_area_width = svg.attr("width") - margin.left-margin.right
  chart_area_height = svg.attr("height") - margin.top - margin.bottom

  line_chart_scales.x.rangePoints([0, chart_area_width])
  line_chart_scales.y_left.range([chart_area_height,0])
  line_chart_scales.y_right.range([chart_area_height,0])
    
  svg.append("g")
    .attr("id", "time_axis")
    .attr("transform", "translate(#{margin.left},#{margin.top+chart_area_height})")
    .call(time_axis)

  svg.append("g")
    .attr("id", "left_axis")
    .attr("transform", "translate(#{margin.left},#{margin.top})")
    .call(left_axis)

  svg.append("g")
    .attr("id", "right_axis")
    .attr("transform", "translate(#{margin.left+chart_area_width},#{margin.top})")
    .call(right_axis)

  chart_area = svg.append("g")
    .attr("id", "chart_area")
    .attr("transform", "translate(#{margin.left},#{margin.top})")


visitor_pie_chart = (container) ->
  svg = set_up_svg(container)
  color = d3.scale.category20c()

  center_x = svg.attr("width") / 2
  center_y = svg.attr("height") / 2

  pie_layout = d3.layout.pie()
    .value((d) -> d.val)

  pie_arc = d3.svg.arc()
    .outerRadius(100)
    .innerRadius(0)
  chart_area = svg.append("g")
    .attr("id", "pie_chart_area")
    .attr("transform", "translate(#{center_x},#{center_y})")
  pie_data = ["VISUSW", "VISUSE", "VISJP", "VISCAN"].map((d) -> 
    data_point = ts_annual["#{d}@KAU.A"].data.filter((d) -> +d.period == 2013)[0].val
    { val: +data_point, s_name: d }
  )

  chart_area.selectAll("path")
    .data(pie_layout(pie_data))
    .enter()
    .append("path")
    .attr("d", pie_arc)
    .attr("fill", (d) -> color(d.data.s_name))
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .on("mouseover", (d,i) ->
      slice = d3.select(this)
      slice.attr("fill-opacity", ".3")

      chart_area.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate( #{pie_arc.centroid(d)} )" )
        .text(d.data.s_name)
    )
    .on("mouseout", (d) -> 
      slice = d3.select(this)
      slice.attr("fill-opacity", "1")
      chart_area.select("text").remove()
    )

get_all_csv_data_for_series = (series) ->
  array_to_populate = []
  array_to_populate.push({ period:row.period.slice(0,4) , val:row[series] }) for row in csv_data_a
  array_to_populate

filter_and_format_time_series = (series_data) ->
  series_data.filter((d) -> d.val != "")
    .map((d) -> 
      period: d.period
      val:+d.val
    )

spark_formatted_data = (series) ->
  get_all_csv_data_for_series(series).map((d)->
    if d.val == "" then null else +d.val
  )

set_ts_data = (series) ->
  series_data = filter_and_format_time_series get_all_csv_data_for_series(series)
  ts_annual[series] =
    name: series 
    data: series_data
    category: csv_headers.category[series]
    spark_data: spark_formatted_data(series)

series_array_from_csv_data = (csv_data) ->
  d3.keys(csv_data[0]).slice(1)

prepare_csv_headers = (csv_data) ->
    h = csv_data.slice(0,4)
    display_names: h[0]
    category: h[1]
    primary: "secondary"#h[2]
    full_name: h[3]
  
load_annual_data = () ->
  d3.csv("data/kauai_data_annual.csv", (data) ->
    csv_data_a = data.slice(5)
    csv_headers = prepare_csv_headers data

    all_dates = csv_data_a.map((d) -> +d.period.slice(0,4))
    set_ts_data series for series in series_array_from_csv_data(data)
    ts_by_category = d3.nest().key((d) -> d.category).map(d3.values(ts_annual))

    console.log(ts_annual)
    console.log(ts_by_category)
    console.log(all_dates)

    dashboard_elements = [ 
      { id: "line_chart", width: 425, height: 300, type_function: visitor_line_chart },
      { id: "pie_chart", width: 300, height: 300, type_function: visitor_pie_chart },
    ]
    set_up_dashboard_elements(dashboard_elements)
    create_series_display()
    set_up_sliders()
    page_setup()
  )

collapse = (cat) ->
  cat.transition()
    .style("height", series_height + "px")
    .style("line-height", series_height + "px")
    .attr "state", "collapsed"

  d3.select(cat.node().parentNode)
    .selectAll("div.series")
    .transition()
    .style "height", (d) -> (if d.primary is "Primary" then series_height + "px" else "0px")

expand = (cat) ->
  cat.transition()
    .style("height", (d) -> (d.value.length * series_height) + "px")
    .style("line-height", (d) ->(d.value.length * series_height) + "px")
    .attr "state", "expanded"

  d3.select(cat.node().parentNode)
    .selectAll("div.series")
    .transition()
    .style "height", series_height + "px"

toggle_left_axis_button = (series) ->
  console.log("#s_row_#{series_to_class(series)}")
  button = d3.select("#s_row_#{series_to_class(series)} .left_toggle")
  if button.classed("off")
    button.text("-").attr("class", "left_toggle on")
  else
    button.text("+").attr("class", "left_toggle off")

toggle_right_axis_button = (series) ->
  console.log("#s_row_#{series_to_class(series)}")
  button = d3.select("#s_row_#{series_to_class(series)} .right_toggle")
  if button.classed("off")
    button.text("-").attr("class", "right_toggle on")
  else
    button.text("+").attr("class", "right_toggle off")
			
create_series_display = ->
  cat_divs = d3.select("#series_display")
    .selectAll("div.category")
    .data(d3.entries(ts_by_category))
    .enter()
    .append("div")
    .attr("class", "category")

  cat_labels = cat_divs.append("div")
    .attr("class", "cat_label")
    .attr("id",(d)->"cat_#{d.key}")
    .attr("state", "expanded")
    .text((d) -> d.key)
    .style("height", (d) -> (d.value.length * series_height) + "px")
    .style("line-height", (d) -> (d.value.length * series_height) + "px")
    .on("mouseover", (d) -> d3.select(this).style "background-color", "#999")
    .on("mouseout", (d) -> d3.selectAll(".cat_label").style "background-color", "#CCC")
    .on("click", (d) ->
      cat = d3.select(this)
      if cat.attr("state") is "expanded"
        collapse cat
      else
        expand cat
     )

  cat_series = cat_divs.append("div")
    .attr("class", "cat_series")
    .selectAll("div.series").data((d) -> d.value)
    .enter()
    .append("div")
    .attr("id",(d) -> "s_row_#{series_to_class(d.name)}")
    .attr("class", "series")
    .style("height", series_height + "px")
    .on("mouseover", (d) ->
      this_cat = d3.select(this).style("background-color", "#EEE")
      this_cat.selectAll(".selected_value").style "font-weight", "bold"
      this_cat.selectAll(".selected_perc").style "font-weight", "bold"
    )
    .on("mouseout", (d) ->
      d3.selectAll(".series")
        .style("background-color", "#FFF")
        .selectAll("div")
        .style "font-weight", "normal"
    )

  cat_series.append("div")
    .attr("class", "series_label")
    .style("line-height", series_height + "px")
    .append("span")
    .text((d) -> d.name)

  spark_paths = cat_series.append("svg")
    .attr("class", "sparkline")
    .attr("height", series_height)
    .attr("width", 150)

  draw_sparklines [ 0, all_dates.length - 1 ], 0

  left_axis_controls = cat_series.append("div")
    .attr("class", "left_toggle off")
    .text("+")
    .on("click", (d) -> 
      button = d3.select(this)
      if (button.classed("off"))
        add_to_line_chart_left_axis(d.name)
      else
        remove_from_line_chart_left_axis(d.name)
    )

  right_axis_controls = cat_series.append("div")
    .attr("class", "right_toggle off")
    .text("+")
    .on("click", (d) -> 
      button = d3.select(this)
      if (button.classed("off"))
        add_to_line_chart_right_axis(d.name)
      else
        remove_from_line_chart_right_axis(d.name)
    )

draw_sparklines = (extent, duration) ->
  cat_series = d3.selectAll("div.series")
  start_i = extent[0]
  end_i = extent[1]
  point = end_i - start_i
  x.domain([ 0, end_i - start_i ])

  trimmed_dates = all_dates.slice(start_i, end_i + 1)
  d3.select("#sparkline_header").text trimmed_dates[end_i - start_i]
  svg = cat_series.select("svg").datum((d) ->
    trimmed_data_object d, start_i, end_i
  )
  draw_spark_path svg, duration
  draw_spark_area svg, duration

draw_spark_path = (svg, duration) ->
  spark_path = svg.selectAll("path.spark")
    .data( (d) -> [ d.scaled_data ] )

  spark_path
    .enter()
    .append("path")
    .attr("class", "spark")
    .attr("stroke", "#3182bd")
    .attr "fill", "none"

  spark_path
    .transition()
    .duration(duration)
    .attr "d", spark_line

draw_spark_area = (svg, duration) ->
  spark_area = svg.selectAll("path.spark_area")
    .data((d) -> [ d.scaled_data ])

  spark_area
    .enter()
    .append("path")
    .attr("class", "spark_area")
    .attr("stroke", "none")
    .attr("fill", "#3182bd")
    .attr "fill-opacity", .1

  spark_area
    .transition()
    .duration(duration)
    .attr "d", spark_area_path
  
trimmed_data_object = (d, start_i, end_i) ->
  new_d = jQuery.extend(true, {}, d)
  new_d.spark_data = d.spark_data.slice(start_i, end_i + 1)
  y.domain d3.extent(new_d.spark_data)
  new_d.scaled_data = new_d.spark_data.map((e) -> (if e is null then null else y(e)))
  new_d

trim_sparklines = (event, ui) ->
  draw_sparklines ui.values, 0

set_slider_in_div = (div_id, val1, val2, slide_func) ->
  console.log("setting up slider")
  d3.select("#" + div_id).remove()
  d3.select("#" + div_id.replace("div", "container")).insert("div", "div#buttons").attr("id", div_id).attr "class", "slider"
  $("#" + div_id).slider
    range: true
    min: 0
    max: all_dates.length - 1
    values: [ val1, val2 ]
    slide: slide_func

set_up_sliders = ->
  set_slider_in_div "sparkline_slider_div", 0, all_dates.length - 1, trim_sparklines

page_setup = () ->
  collapse d3.select("#cat_Construction")
  collapse d3.select("#cat_Employment")
  collapse d3.select("#cat_General")
  collapse d3.select("#cat_Income")
  #s_left = ts_annual["VIS@KAU.A"].data.filter((d) -> +d.period <= end_date and +d.period >= start_date)
  #s_right = ts_annual["EMPL@KAU.A"].data.filter((d) -> +d.period <= end_date and +d.period >= start_date)
  

load_annual_data()
set_up_nav()
set_headline("In 2013, per person per trip spending increaed by 9.63% compared to the previous year")
