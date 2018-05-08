var loopCount = 9;
var classDataArray = [];
var classData = {};


// Fake data
function populateData(){
	for(i = 0; i < loopCount ; i++){
		classData = {};
		classData.className = 'CS101';
		classData.classGPA = '3.89';
		classData.classDescription = 'Fundamental principles, concepts, and methods of computing, with emphasis on applications in the physical sciences and engineering...';
		classData.prereq = ['MATH 220','MATH 221'];
		classData.prereqLinks = ['https://courses.illinois.edu/schedule/terms/MATH/220','https://courses.illinois.edu/schedule/terms/MATH/221'];
		classData.link = 'www.instagram.com';
		classDataArray.push(classData);
	}
}

function drawBoxes(){
	console.log("Attempting to Draw Boxes");
	var tempHTML = "";

	for(i = 0; i < classDataArray.length; i++){
		console.log("Printing box number " + i);
		tempHTML += '<div class="col-md-4">'
		tempHTML += '<div class="card mb-4 box-shadow">'
		tempHTML += '<div class="card-body">';
		tempHTML += '<h3>' + classDataArray[i].className + '</h3>';
		tempHTML += '<h6>Average GPA: ' + classDataArray[i].classGPA + '</h6>';
		tempHTML += '<p class="card-text">' + classDataArray[i].classDescription + '<p>';

		if(classDataArray[i].prereq.length == classDataArray[i].prereqLinks.length) {
			tempHTML += 'Prerequisites ';

			//TODO: Fix later
			if(classDataArray[i].prereq.length == 1) {
				tempHTML += '<a href="' + classDataArray[i].prereqLinks[0] + '">' + classDataArray[i].prereq[0] + '</a>';
			} else if(classDataArray[i].prereq.length == 2) {
				tempHTML += '<a href="' + classDataArray[i].prereqLinks[0] + '">' + classDataArray[i].prereq[0] + '</a>';
				tempHTML += ' and/or <a href="' + classDataArray[i].prereqLinks[1] + '">' + classDataArray[i].prereq[1] + '</a>';
			} else {
				for(j = 0; j < classDataArray[i].prereq.length; j++) {
					if(j == classDataArray[j].prereq.length - 1) {
						tempHTML += ' and/or <a href="' + classDataArray[i].prereqLinks[j] + '">' + classDataArray[i].prereq[j] + '</a>';
					} else {
						tempHTML += '<a href="' + classDataArray[i].prereqLinks[j] + '">' + classDataArray[i].prereq[j] + ', </a>';
					}
				}
			}
		}

		tempHTML += '</p></p>';

	    tempHTML += '<div class="d-flex justify-content-between align-items-center">';
	    tempHTML += '<a class="btn btn-primary" href="' + classDataArray[i].link +'" role="button">Page</a>';
	    tempHTML += '</div></div></div></div>';
	}

	$('#testCS101').append(tempHTML);
}

populateData();

drawBoxes();