
function shuffle(array) {
  var currentIndex = array.length
    , temporaryValue
    , randomIndex
    ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function replace_space_with_underscore(item){
	return item.replace(/ /g, "_");
}

function numify(float_string) {
	var num = parseFloat(float_string.replace(',','').replace(/\s/g,''),10)
	return isNaN(num) ? 0 : num
}
function intify(int_string) {
  var num = parseInt(int_string.replace(',','').replace(/\s/g,''),10)
  return isNaN(num) ? 0 : num
}


d3.select("h1").text("this is working")