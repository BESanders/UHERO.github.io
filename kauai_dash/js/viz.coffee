---
---
annual_csv_data = []
annual_time_series = {}
line_chart_scales = 
  x: d3.scale.ordinal().domain(num for num in [2004..2013])
  y_left: d3.scale.linear()
  y_right: d3.scale.linear()

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

visitor_line_chart = (container) ->
  svg = set_up_svg(container)
  margin = 
    top: 10
    bottom: 10
    left: 30
    right: 20
  chart_area_width = svg.attr("width") - margin.left-margin.right
  chart_area_height = svg.attr("height") - margin.top - margin.bottom
  s_left = annual_time_series["VIS@KAU.A"]
  s_right = annual_time_series["VISUSE@KAU.A"]
  console.log("#{chart_area_width} x #{chart_area_height}")
  line_chart_scales.x.rangePoints([0, chart_area_width])
  line_chart_scales.y_left.domain(s_left.val_domain).range([chart_area_height,0])
  line_chart_scales.y_right.domain(s_right.val_domain).range([chart_area_width,0])
  #add axes
  #add series

visitor_pie_chart = (container) ->
  svg = set_up_svg(container)

set_ts_data = (series) ->
  series_data = []
  series_data.push({ period:row.period.slice(0,4) , val:row[series] }) for row in annual_csv_data
  series_data = series_data.filter((d) -> d.val != "")
  annual_time_series[series] = 
    period_domain: d3.extent(series_data.map((d) -> d.period))
    val_domain: d3.extent(series_data.map((d) -> d.val))
    data: series_data

load_annual_data = () ->
  d3.csv("data/kauai_data_annual.csv", (data) ->
    annual_csv_data = data
    years_array = data.map((d)->d.period.slice(0,4))
    series_array = d3.keys(data[0]).slice(1)
    set_ts_data series for series in series_array
    console.log(annual_time_series)
    dashboard_elements = [ 
      { id: "line_chart", width: 425, height: 300, type_function: visitor_line_chart },
      { id: "pie_chart", width: 300, height: 300, type_function: visitor_pie_chart },
    ]
    set_up_dashboard_elements(dashboard_elements)
  )

load_annual_data()
set_up_nav()
set_headline("In 2013, per person per trip spending increaed by 9.63% compared to the previous year")
