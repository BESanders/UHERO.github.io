
var data = {}
var schools

function set_up_data_objects(results) {
	data_file_names.forEach(function(data_name, i) {
		data[data_name] = results[i]
	})
	
	var college_data_by_school = d3.nest().key(function(d) { return d.SchCode }).map(data["college_data"])
	var proficiency_by_school = d3.nest().key(function(d) { return d.SchCode }).map(data["proficiency"])
	var staff_by_school = d3.nest().key(function(d) { return d.SchCode }).map(data["staff"])
	var strive_by_school = d3.nest().key(function(d) { return d["School ID"] }).map(data["strive"])
	
	schools = data["school_info"].slice()
	schools.forEach(function(d) { 
		d.college = college_data_by_school[d.school_id] ? college_data_by_school[d.school_id] : []
		d.proficiency = proficiency_by_school[d.school_id] ? proficiency_by_school[d.school_id] : []
		d.staff = staff_by_school[d.school_id] ? staff_by_school[d.school_id] : [] 
		if (strive_by_school[d.school_id]) {
			d.strive =  strive_by_school[d.school_id]
			d.strive_index_score = d.strive[0]["Final Index Score"]
			d.strive_step = d.strive[0]["Strive HI Step"]
			d.reading_proficiency = d.strive[0]["Reading Proficiency (%)"]
			d.math_proficiency = d.strive[0]["Math Proficiency (%)"]
			d.science_proficiency = d.strive[0]["Science Proficiency (%)"]
			d.reading_sgp = d.strive[0]["Reading Median SGP"]
			d.math_sgp = d.strive[0]["Math Median SGP"]
			
		} else {
			d.strive = []
		}
		
	})
	
	
}




