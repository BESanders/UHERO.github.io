require "csv"
country_hash = {}
header_row = []
["constant", "low", "medium", "high"].each do |scenario|
  CSV.foreach("nta_countries_pop_projections_#{scenario}.csv") do |row| 
    if row[2] == "Major area region country or area"
      header_row = row
    else
      country_hash[row[2]] ||= [] 
      country_hash[row[2]].push(row) unless row[1] == "Estimates" and scenario != "constant"
    end
  end
end

country_hash.keys.each do |country|
  CSV.open("#{country}.csv", "wb") do |csv|
    csv << header_row
    country_hash[country].each { |row| csv << row }
  end
end
