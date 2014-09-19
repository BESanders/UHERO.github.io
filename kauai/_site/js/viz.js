(function() {
  var add_to_line_chart_right_axis, add_to_pie, all_dates, chart_extent, collapse, combine_extent, create_series_display, csv_data_a, csv_headers, draw_spark_area, draw_spark_path, draw_sparklines, dummy_path, end_date, expand, filter_and_format_time_series, get_all_csv_data_for_series, get_data_in_chart_view, get_series_extent, left_axis, line_chart_scales, load_annual_data, num, page_setup, path_left, path_right, prepare_csv_headers, remove_from_line_chart_right_axis, remove_from_pie, right_axis, series_array_from_csv_data, series_height, series_to_class, set_headline, set_slider_in_div, set_ts_data, set_up_dashboard_elements, set_up_div, set_up_nav, set_up_sliders, set_up_svg, spark_area_path, spark_formatted_data, spark_line, start_date, time_axis, toggle_left_axis_button, toggle_right_axis_button, trim_sparklines, trimmed_data_object, ts_by_category, visitor_line_chart, visitor_pie_chart, x, y;

  csv_data_a = [];

  csv_headers = {};

  window.ts_annual = {};

  ts_by_category = {};

  start_date = 2004;

  end_date = 2013;

  all_dates = [];

  series_height = 45;

  line_chart_scales = {
    x: d3.scale.ordinal().domain((function() {
      var _i, _results;
      _results = [];
      for (num = _i = start_date; start_date <= end_date ? _i <= end_date : _i >= end_date; num = start_date <= end_date ? ++_i : --_i) {
        _results.push(num);
      }
      return _results;
    })()),
    y_left: d3.scale.linear(),
    y_right: d3.scale.linear()
  };

  time_axis = d3.svg.axis().scale(line_chart_scales.x);

  left_axis = d3.svg.axis().scale(line_chart_scales.y_left).orient("left");

  right_axis = d3.svg.axis().scale(line_chart_scales.y_right).orient("right");

  dummy_path = d3.svg.line().x(function(d, i) {
    return line_chart_scales.x(start_date + i);
  }).y(0);

  path_left = d3.svg.line().x(function(d) {
    return line_chart_scales.x(+d.period);
  }).y(function(d) {
    return line_chart_scales.y_left(d.val);
  });

  path_right = d3.svg.line().x(function(d) {
    return line_chart_scales.x(+d.period);
  }).y(function(d) {
    return line_chart_scales.y_right(d.val);
  });

  x = d3.scale.linear().clamp(true).range([0, 145]);

  y = d3.scale.linear().range([series_height, 5]);

  spark_line = d3.svg.line().x(function(d, i) {
    return x(i);
  }).y(function(d) {
    return d;
  }).defined(function(d) {
    return d !== null;
  });

  spark_area_path = d3.svg.area().x(function(d, i) {
    return x(i);
  }).y1(function(d) {
    return d;
  }).y0(series_height).defined(function(d) {
    return d !== null;
  });

  window.data_categories = {
    "major indicators": {
      width: 130
    },
    "visitor industry": {
      width: 140
    },
    "labor": {
      width: 100
    },
    "personal income": {
      width: 120
    },
    "construction": {
      width: 100
    },
    "county revenue": {
      width: 120
    }
  };

  set_up_nav = function() {
    return d3.select("div#nav").selectAll("div.nav_link").data(d3.entries(data_categories)).enter().append("div").attr("class", "nav_link").attr("id", function(d) {
      return d.key.replace(" ", "_");
    }).style("width", function(d) {
      return d.value.width + "px";
    }).text(function(d) {
      return d.key;
    });
  };

  set_headline = function(text) {
    return d3.select("#headline").text(text);
  };

  set_up_dashboard_elements = function(elements) {
    var elem, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = elements.length; _i < _len; _i++) {
      elem = elements[_i];
      _results.push(set_up_div(elem));
    }
    return _results;
  };

  set_up_div = function(elem) {
    return d3.select("#chart_area").append("div").attr("class", "dashboard_element").attr("id", elem.id).style("width", elem.width + "px").style("height", elem.height + "px").call(elem.type_function);
  };

  set_up_svg = function(container) {
    var height, width;
    width = +container.style("width").slice(0, -2);
    height = +container.style("height").slice(0, -2);
    return container.append("svg").attr("id", container.attr("id") + "_svg").attr("height", height).attr("width", width);
  };

  series_to_class = function(series_name) {
    return series_name.replace(".", "_").replace("@", "_").replace("%", "pct");
  };

  chart_extent = function(array) {
    var full_extent, range;
    full_extent = d3.extent(array);
    range = full_extent[1] - full_extent[0];
    return [full_extent[0] - range * .1, full_extent[1] + range * .1];
  };

  get_data_in_chart_view = function(series_name) {
    return ts_annual[series_name].data.filter(function(d) {
      return +d.period <= end_date && +d.period >= start_date;
    });
  };

  get_series_extent = function(series_data) {
    return chart_extent(series_data.map(function(d) {
      return +d.val;
    }));
  };

  combine_extent = function(ex1, ex2) {
    return [d3.min([ex1[0], ex2[0]]), d3.max([ex1[1], ex2[1]])];
  };

  window.update_domain_left = function(series_datas) {
    var all_data, series, _i, _len;
    if (series_datas.length === 0) {
      return [0, 1];
    }
    all_data = [];
    for (_i = 0, _len = series_datas.length; _i < _len; _i++) {
      series = series_datas[_i];
      all_data = all_data.concat(series);
    }
    return line_chart_scales.y_left.domain(get_series_extent(all_data));
  };

  window.update_domain_right = function(series_datas) {
    var all_data, series, _i, _len;
    if (series_datas.length === 0) {
      return [0, 1];
    }
    all_data = [];
    for (_i = 0, _len = series_datas.length; _i < _len; _i++) {
      series = series_datas[_i];
      all_data = all_data.concat(series);
    }
    return line_chart_scales.y_right.domain(get_series_extent(all_data));
  };

  window.add_to_line_chart_left_axis = function(series) {
    var chart_area, cur_domain, data, domain, duration;
    duration = 500;
    chart_area = d3.select("g#chart_area");
    data = get_data_in_chart_view(series);
    domain = get_series_extent(data);
    cur_domain = line_chart_scales.y_left.domain();
    if (!chart_area.selectAll("path.s_left").empty()) {
      domain = combine_extent(cur_domain, domain);
    }
    line_chart_scales.y_left.domain(domain).nice();
    d3.select("#left_axis").transition().duration(duration).call(left_axis);
    chart_area.append("path").datum(data).attr("id", "s_left_" + (series_to_class(series))).attr("class", "s_left line_chart_path").attr("stroke", "#777").attr("d", dummy_path);
    chart_area.selectAll("path.s_left").transition().duration(duration).attr("d", path_left);
    return toggle_left_axis_button(series);
  };

  add_to_line_chart_right_axis = function(series) {
    var chart_area, cur_domain, data, domain, duration;
    console.log("sending to right");
    duration = 500;
    chart_area = d3.select("g#chart_area");
    data = get_data_in_chart_view(series);
    domain = get_series_extent(data);
    cur_domain = line_chart_scales.y_right.domain();
    if (!chart_area.selectAll("path.s_right").empty()) {
      domain = combine_extent(cur_domain, domain);
    }
    line_chart_scales.y_right.domain(domain).nice();
    d3.select("#right_axis").transition().duration(duration).call(right_axis);
    chart_area.append("path").datum(data).attr("id", "s_right_" + (series_to_class(series))).attr("class", "s_right line_chart_path").attr("stroke", "#BBB").attr("d", dummy_path);
    chart_area.selectAll("path.s_right").transition().duration(duration).attr("d", path_right);
    return toggle_right_axis_button(series);
  };

  window.remove_from_line_chart_left_axis = function(series) {
    var chart_area, duration;
    duration = 500;
    chart_area = d3.select("g#chart_area");
    d3.select("#s_left_" + (series_to_class(series))).remove();
    update_domain_left(chart_area.selectAll(".s_left").data());
    d3.select("#left_axis").transition().duration(duration).call(left_axis);
    chart_area.selectAll("path.s_left").transition().duration(duration).attr("d", path_left);
    return toggle_left_axis_button(series);
  };

  remove_from_line_chart_right_axis = function(series) {
    var chart_area, duration;
    console.log("removing_from_right");
    duration = 500;
    chart_area = d3.select("g#chart_area");
    d3.select("#s_right_" + (series_to_class(series))).remove();
    update_domain_right(chart_area.selectAll(".s_right").data());
    d3.select("#right_axis").transition().duration(duration).call(right_axis);
    chart_area.selectAll("path.s_right").transition().duration(duration).attr("d", path_right);
    return toggle_right_axis_button(series);
  };

  add_to_pie = function(series) {
    return console.log("sending to right");
  };

  remove_from_pie = function(series) {
    return console.log("removing from left");
  };

  visitor_line_chart = function(container) {
    var chart_area, chart_area_height, chart_area_width, margin, svg;
    svg = set_up_svg(container);
    margin = {
      top: 10,
      bottom: 25,
      left: 50,
      right: 50
    };
    chart_area_width = svg.attr("width") - margin.left - margin.right;
    chart_area_height = svg.attr("height") - margin.top - margin.bottom;
    line_chart_scales.x.rangePoints([0, chart_area_width]);
    line_chart_scales.y_left.range([chart_area_height, 0]);
    line_chart_scales.y_right.range([chart_area_height, 0]);
    svg.append("g").attr("id", "time_axis").attr("transform", "translate(" + margin.left + "," + (margin.top + chart_area_height) + ")").call(time_axis);
    svg.append("g").attr("id", "left_axis").attr("transform", "translate(" + margin.left + "," + margin.top + ")").call(left_axis);
    svg.append("g").attr("id", "right_axis").attr("transform", "translate(" + (margin.left + chart_area_width) + "," + margin.top + ")").call(right_axis);
    return chart_area = svg.append("g").attr("id", "chart_area").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  };

  visitor_pie_chart = function(container) {
    var center_x, center_y, chart_area, color, pie_arc, pie_data, pie_layout, svg;
    svg = set_up_svg(container);
    color = d3.scale.category20c();
    center_x = svg.attr("width") / 2;
    center_y = svg.attr("height") / 2;
    pie_layout = d3.layout.pie().value(function(d) {
      return d.val;
    });
    pie_arc = d3.svg.arc().outerRadius(100).innerRadius(0);
    chart_area = svg.append("g").attr("id", "pie_chart_area").attr("transform", "translate(" + center_x + "," + center_y + ")");
    pie_data = ["VISUSW", "VISUSE", "VISJP", "VISCAN"].map(function(d) {
      var data_point;
      data_point = ts_annual["" + d + "@KAU.A"].data.filter(function(d) {
        return +d.period === 2013;
      })[0].val;
      return {
        val: +data_point,
        s_name: d
      };
    });
    return chart_area.selectAll("path").data(pie_layout(pie_data)).enter().append("path").attr("d", pie_arc).attr("fill", function(d) {
      return color(d.data.s_name);
    }).attr("stroke", "white").attr("stroke-width", 2).on("mouseover", function(d, i) {
      var slice;
      slice = d3.select(this);
      slice.attr("fill-opacity", ".3");
      return chart_area.append("text").attr("text-anchor", "middle").attr("transform", "translate( " + (pie_arc.centroid(d)) + " )").text(d.data.s_name);
    }).on("mouseout", function(d) {
      var slice;
      slice = d3.select(this);
      slice.attr("fill-opacity", "1");
      return chart_area.select("text").remove();
    });
  };

  get_all_csv_data_for_series = function(series) {
    var array_to_populate, row, _i, _len;
    array_to_populate = [];
    for (_i = 0, _len = csv_data_a.length; _i < _len; _i++) {
      row = csv_data_a[_i];
      array_to_populate.push({
        period: row.period.slice(0, 4),
        val: row[series]
      });
    }
    return array_to_populate;
  };

  filter_and_format_time_series = function(series_data) {
    return series_data.filter(function(d) {
      return d.val !== "";
    }).map(function(d) {
      return {
        period: d.period,
        val: +d.val
      };
    });
  };

  spark_formatted_data = function(series) {
    return get_all_csv_data_for_series(series).map(function(d) {
      if (d.val === "") {
        return null;
      } else {
        return +d.val;
      }
    });
  };

  set_ts_data = function(series) {
    var series_data;
    series_data = filter_and_format_time_series(get_all_csv_data_for_series(series));
    return ts_annual[series] = {
      name: series,
      data: series_data,
      category: csv_headers.category[series],
      spark_data: spark_formatted_data(series)
    };
  };

  series_array_from_csv_data = function(csv_data) {
    return d3.keys(csv_data[0]).slice(1);
  };

  prepare_csv_headers = function(csv_data) {
    var h;
    h = csv_data.slice(0, 4);
    return {
      display_names: h[0],
      category: h[1],
      primary: "secondary",
      full_name: h[3]
    };
  };

  load_annual_data = function() {
    return d3.csv("data/kauai_data_annual.csv", function(data) {
      var dashboard_elements, series, _i, _len, _ref;
      csv_data_a = data.slice(5);
      csv_headers = prepare_csv_headers(data);
      all_dates = csv_data_a.map(function(d) {
        return +d.period.slice(0, 4);
      });
      _ref = series_array_from_csv_data(data);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        series = _ref[_i];
        set_ts_data(series);
      }
      ts_by_category = d3.nest().key(function(d) {
        return d.category;
      }).map(d3.values(ts_annual));
      console.log(ts_annual);
      console.log(ts_by_category);
      console.log(all_dates);
      dashboard_elements = [
        {
          id: "line_chart",
          width: 425,
          height: 300,
          type_function: visitor_line_chart
        }, {
          id: "pie_chart",
          width: 300,
          height: 300,
          type_function: visitor_pie_chart
        }
      ];
      set_up_dashboard_elements(dashboard_elements);
      create_series_display();
      set_up_sliders();
      return page_setup();
    });
  };

  collapse = function(cat) {
    cat.transition().style("height", series_height + "px").style("line-height", series_height + "px").attr("state", "collapsed");
    return d3.select(cat.node().parentNode).selectAll("div.series").transition().style("height", function(d) {
      if (d.primary === "Primary") {
        return series_height + "px";
      } else {
        return "0px";
      }
    });
  };

  expand = function(cat) {
    cat.transition().style("height", function(d) {
      return (d.value.length * series_height) + "px";
    }).style("line-height", function(d) {
      return (d.value.length * series_height) + "px";
    }).attr("state", "expanded");
    return d3.select(cat.node().parentNode).selectAll("div.series").transition().style("height", series_height + "px");
  };

  toggle_left_axis_button = function(series) {
    var button;
    console.log("#s_row_" + (series_to_class(series)));
    button = d3.select("#s_row_" + (series_to_class(series)) + " .left_toggle");
    if (button.classed("off")) {
      return button.text("-").attr("class", "left_toggle on");
    } else {
      return button.text("+").attr("class", "left_toggle off");
    }
  };

  toggle_right_axis_button = function(series) {
    var button;
    console.log("#s_row_" + (series_to_class(series)));
    button = d3.select("#s_row_" + (series_to_class(series)) + " .right_toggle");
    if (button.classed("off")) {
      return button.text("-").attr("class", "right_toggle on");
    } else {
      return button.text("+").attr("class", "right_toggle off");
    }
  };

  create_series_display = function() {
    var cat_divs, cat_labels, cat_series, left_axis_controls, right_axis_controls, spark_paths;
    cat_divs = d3.select("#series_display").selectAll("div.category").data(d3.entries(ts_by_category)).enter().append("div").attr("class", "category");
    cat_labels = cat_divs.append("div").attr("class", "cat_label").attr("id", function(d) {
      return "cat_" + d.key;
    }).attr("state", "expanded").text(function(d) {
      return d.key;
    }).style("height", function(d) {
      return (d.value.length * series_height) + "px";
    }).style("line-height", function(d) {
      return (d.value.length * series_height) + "px";
    }).on("mouseover", function(d) {
      return d3.select(this).style("background-color", "#999");
    }).on("mouseout", function(d) {
      return d3.selectAll(".cat_label").style("background-color", "#CCC");
    }).on("click", function(d) {
      var cat;
      cat = d3.select(this);
      if (cat.attr("state") === "expanded") {
        return collapse(cat);
      } else {
        return expand(cat);
      }
    });
    cat_series = cat_divs.append("div").attr("class", "cat_series").selectAll("div.series").data(function(d) {
      return d.value;
    }).enter().append("div").attr("id", function(d) {
      return "s_row_" + (series_to_class(d.name));
    }).attr("class", "series").style("height", series_height + "px").on("mouseover", function(d) {
      var this_cat;
      this_cat = d3.select(this).style("background-color", "#EEE");
      this_cat.selectAll(".selected_value").style("font-weight", "bold");
      return this_cat.selectAll(".selected_perc").style("font-weight", "bold");
    }).on("mouseout", function(d) {
      return d3.selectAll(".series").style("background-color", "#FFF").selectAll("div").style("font-weight", "normal");
    });
    cat_series.append("div").attr("class", "series_label").style("line-height", series_height + "px").append("span").text(function(d) {
      return d.name;
    });
    spark_paths = cat_series.append("svg").attr("class", "sparkline").attr("height", series_height).attr("width", 150);
    draw_sparklines([0, all_dates.length - 1], 0);
    left_axis_controls = cat_series.append("div").attr("class", "left_toggle off").text("+").on("click", function(d) {
      var button;
      button = d3.select(this);
      if (button.classed("off")) {
        return add_to_line_chart_left_axis(d.name);
      } else {
        return remove_from_line_chart_left_axis(d.name);
      }
    });
    return right_axis_controls = cat_series.append("div").attr("class", "right_toggle off").text("+").on("click", function(d) {
      var button;
      button = d3.select(this);
      if (button.classed("off")) {
        return add_to_line_chart_right_axis(d.name);
      } else {
        return remove_from_line_chart_right_axis(d.name);
      }
    });
  };

  draw_sparklines = function(extent, duration) {
    var cat_series, end_i, point, start_i, svg, trimmed_dates;
    cat_series = d3.selectAll("div.series");
    start_i = extent[0];
    end_i = extent[1];
    point = end_i - start_i;
    x.domain([0, end_i - start_i]);
    trimmed_dates = all_dates.slice(start_i, end_i + 1);
    d3.select("#sparkline_header").text(trimmed_dates[end_i - start_i]);
    svg = cat_series.select("svg").datum(function(d) {
      return trimmed_data_object(d, start_i, end_i);
    });
    draw_spark_path(svg, duration);
    return draw_spark_area(svg, duration);
  };

  draw_spark_path = function(svg, duration) {
    var spark_path;
    spark_path = svg.selectAll("path.spark").data(function(d) {
      return [d.scaled_data];
    });
    spark_path.enter().append("path").attr("class", "spark").attr("stroke", "#3182bd").attr("fill", "none");
    return spark_path.transition().duration(duration).attr("d", spark_line);
  };

  draw_spark_area = function(svg, duration) {
    var spark_area;
    spark_area = svg.selectAll("path.spark_area").data(function(d) {
      return [d.scaled_data];
    });
    spark_area.enter().append("path").attr("class", "spark_area").attr("stroke", "none").attr("fill", "#3182bd").attr("fill-opacity", .1);
    return spark_area.transition().duration(duration).attr("d", spark_area_path);
  };

  trimmed_data_object = function(d, start_i, end_i) {
    var new_d;
    new_d = jQuery.extend(true, {}, d);
    new_d.spark_data = d.spark_data.slice(start_i, end_i + 1);
    y.domain(d3.extent(new_d.spark_data));
    new_d.scaled_data = new_d.spark_data.map(function(e) {
      if (e === null) {
        return null;
      } else {
        return y(e);
      }
    });
    return new_d;
  };

  trim_sparklines = function(event, ui) {
    return draw_sparklines(ui.values, 0);
  };

  set_slider_in_div = function(div_id, val1, val2, slide_func) {
    console.log("setting up slider");
    d3.select("#" + div_id).remove();
    d3.select("#" + div_id.replace("div", "container")).insert("div", "div#buttons").attr("id", div_id).attr("class", "slider");
    return $("#" + div_id).slider({
      range: true,
      min: 0,
      max: all_dates.length - 1,
      values: [val1, val2],
      slide: slide_func
    });
  };

  set_up_sliders = function() {
    return set_slider_in_div("sparkline_slider_div", 0, all_dates.length - 1, trim_sparklines);
  };

  page_setup = function() {
    collapse(d3.select("#cat_Construction"));
    collapse(d3.select("#cat_Employment"));
    collapse(d3.select("#cat_General"));
    return collapse(d3.select("#cat_Income"));
  };

  load_annual_data();

  set_up_nav();

  set_headline("In 2013, per person per trip spending increaed by 9.63% compared to the previous year");

}).call(this);
