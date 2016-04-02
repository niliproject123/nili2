var TOTAL_NUMBER_OF_FRETS = 5;
var TOTAL_NUMBER_OF_STRINGS = 6;

var maxUiElements = 6;
var uiElements = new Array();
var top = 0;
var neck = 1;
var chord = 2;
var lyrics = 3;
var play = 4;
var stop = 5;
var title = 6;

var originalChordElementList = $(".chord");
var originalLyricsElementList = $(".lyrics");
$.each($(originalChordElementList), function(){this.style.display = "none"});
$.each($(originalLyricsElementList), function(){this.style.display = "none"});
$("#title").hide();


var windowWidth = $(window).width();
var windowHeight = $(window).height();
var ratioWidth = windowWidth/3456; 
var ratioHeight = windowHeight/5184; 

var element_background = document.createElement('img');
var element_title = document.createElement('div');
var element_neck = document.createElement('img');
var element_bottom_stripe = document.createElement('img');
var element_chord = document.createElement('span');
var element_lyrics = document.createElement('span');
var element_logo = document.createElement('img');
var element_next = document.createElement('span');
var element_play = document.createElement('span');

var stringElements = new Array();

var currentChordIndex = 0;

var neckPositions, neckFrets;
var neckPositionElementArray  = new Array()

var playStrummingAnimation = false;

var isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1; //&& ua.indexOf("mobile");

var blinkingList;
var isBlinkOn = false;
var BLINK_INTERVAL = 200;






// 3rd         1st   controls
// A     B     C     D
// 123456123456123456123456
// 000001000001000001000000
// 100001010000000000000000
// 100001000000000000000000
var clickIndex = 0;
var demoIndex = 0;
var demoString = "000000000000000000000000";

function demoFunction()
{
	receivePositionStringFromAndroid(demoString);
	demoString = demoString.substr(0,demoIndex) + '1' + demoString.substr(demoIndex+1);
	demoIndex++;
	setTimeout(demoFunction, 300);
}

if(!isAndroid)
{
	
	document.body.onclick = 
		function()
		{
			//setTimeout(demoFunction, 300);
			//return;
			if(clickIndex==0)
			{
				eventPressedCorrect();
				clickIndex++;
				return;
			}
			if(clickIndex==1)
			{
				eventLiftFingers();
				clickIndex = 0;
				return;
			}
		};
}


document.body.onload = function()
{
	loadScript('neckActions.js');
	loadScript('chords.js');
	loadScript('animation.js');

	document.body.addEventListener('touchstart', touchstartListener, false);
	
	window.setTimeout(initialize, 300);
};

function touchstartListener()
{
	return;
	document.body.innerHTML= "touchstart - <br/>" 
		  + event.changedTouches[0].pageX + ":" + event.changedTouches[0].pageY;
		 event.preventDefault();
}

function initialize()
{
	createElements();
	createTable();
	createStrings()
	blink();


	sendMessageToAndroid("start_chords");
	for(var i=0; i<originalChordElementList.length; i++)
	{
		sendChordToAndroid(currentChordIndex);
		currentChordIndex++;
	}
	sendMessageToAndroid("end_chords");
	currentChordIndex = 0;
	
	currentChordIndex = 0;
	if(originalChordElementList.length!=0)
	{
		setChordText();
		setLyrics();
		setNeckPositionListOn(getPositionListOfChordText(getChordText(currentChordIndex)));
	}
}

var lastEventTime = new Date().getTime();
function checkEventIsReal()
{
	var newEventTime = new Date().getTime();  
	if((newEventTime - lastEventTime) < 250)
	{
		lastEventTime = newEventTime;
		return false;;
	}
	lastEventTime = newEventTime;
	return true;
	
}

function eventLiftFingers()
{
	if(!checkEventIsReal()) return;

	stopStrummingAnimation();
	setLyrics();
	setChordText();
	
	if(!isAndroid)
	{
		setNeckPositionListOn(getPositionListOfChordText(getChordText(currentChordIndex)));
	}

}

function eventPressedCorrect()
{
	if(!checkEventIsReal()) return;

	startStrummingAnimation(200, getChordTopString(getChordText(currentChordIndex)));

	moveToNextChord()

	setAllNeckPositionsOff(false);
	setFingering(getPositionListOfChordText(getChordText(currentChordIndex)));
	setNeckPositionListOn(getPositionListOfChordText(getChordText(currentChordIndex)));
}

function eventStop()
{
	stopStrummingAnimation();
	currentChordIndex = 0;
	
	setChordText();
	setLyrics();

	setAllNeckPositionsOff(false);
	setFingering(getPositionListOfChordText(getChordText(currentChordIndex)));
	setNeckPositionListOn(getPositionListOfChordText(getChordText(currentChordIndex)));
}

function sendChordToAndroid(index)
{
	var currentChordToAndroid = getPositionListOfChordText(originalChordElementList[index].innerHTML);
	if(currentChordToAndroid == null) return;
	currentChordToAndroid = convertPositionListToString(currentChordToAndroid);

	sendMessageToAndroid("addChord_"+currentChordToAndroid.toString());
}

function sendMessageToAndroid(message)
{
	if(isAndroid)	Android.messageFromJs(message);
}

function receivePositionStringFromAndroid(_positionString)
{
	
	var positionOnList = new Array();
	var positionBlinkList = new Array();
	var fretIndex, stringIndex;
	var positionString = _positionString;

	for(var i=0; i<positionString.length; i++)
	{
		var fretIndex =  5 - (1 + Math.floor(i/6));
		var stringIndex = (6 - i%6);
		var position = [fretIndex, stringIndex]; 
		if(positionString.charAt(i)=='1')
		{
			positionOnList.push(position);
			continue;
		}
		if(positionString.charAt(i)!='1' && positionString.charAt(i)!='0')
		{
			positionBlinkList.push(position);
			continue;
		}
	}

	setAllNeckPositionsOff(true);
	setNeckPositionListOn(positionOnList);
	updateBlinkingList(positionBlinkList);
}

function convertPositionListToString(positionList)
{
	var returnedString = "000000000000000000000000";
	
	for(var i=0; i<positionList.length; i++)
	{
		var fret = positionList[i][0];
		var string = positionList[i][1];
		var replaceIndex = 30 - (fret*6 + string);
		returnedString = returnedString.substr(0,replaceIndex) + '1' + returnedString.substr(replaceIndex+1);
	}
	
	return returnedString;
}

function updateBlinkingList(newBlinkingList)
{
	if(blinkingList==null)
	{
		blinkingList = newBlinkingList;
		return;
	}
	blinkingList = newBlinkingList;
}

function blink()
{
	if(blinkingList==null)
	{
		setTimeout(function(){blink();}, BLINK_INTERVAL);
		return;
	}
	if(isBlinkOn)
	{
		setNeckPositionListOff(blinkingList);
		isBlinkOn = false;
	}
	else
	{
		setNeckPositionListOn(blinkingList);
		isBlinkOn = true;
	}
	
	setTimeout(function(){blink();}, BLINK_INTERVAL)
}

function moveToNextChord()
{
	if(currentChordIndex+1>=originalChordElementList.length) return;

	currentChordIndex++;
}

function eventBack()
{
	if(currentChordIndex-1<0) return;

	currentChordIndex--;
	setChordText();
	setLyrics();
}

function setChordText()
{
	if(getChordText(currentChordIndex).indexOf('[')!=-1)
	{
		element_chord.innerHTML = "--";
		return;
	}
	element_chord.innerHTML = getChordText(currentChordIndex);
	
	if(currentChordIndex+1<originalChordElementList.length)
		element_next.innerHTML = getChordText(currentChordIndex+1);
	else
		element_next.innerHTML = "";

	element_chord.style.fontSize = parseInt(getBestFitTextSize(element_chord))*1.2;
	element_next.style.fontSize = parseInt(getBestFitTextSize(element_next))*1.2;
}

function setLyrics()
{
	element_lyrics.innerHTML = originalLyricsElementList[currentChordIndex].innerHTML;
	element_lyrics.style.fontSize = getBestFitTextSize(element_lyrics);

	element_title.innerHTML = originalLyricsElementList[currentChordIndex+1].innerHTML;
	element_title.style.fontSize = getBestFitTextSize(element_title);

}

function clearLyrics()
{
	element_lyrics.innerHTML = "";
}

function setFingering(chordPositionList)
{
	var size = 1.01;
	for(var i=0; i<chordPositionList.length; i++)
	{
		if(chordPositionList[i][2]==null) continue;
		var fingeringElement = document.createElement('span');
		var fret = chordPositionList[i][0];
		var string = chordPositionList[i][1];
		var positionElement = neckPositionElementArray[fret-1][6-string];
		fingeringElement.innerHTML = chordPositionList[i][2];
		fingeringElement.style.fontSize = getBestFitTextSize(positionElement, fingeringElement.innerHTML) * size;
		positionElement.appendChild(fingeringElement);
	}
}

function createTable()
{
	neckPositionElementArray = new Array(TOTAL_NUMBER_OF_FRETS);
	for(var i=0; i<TOTAL_NUMBER_OF_FRETS; i++)
	{
		neckPositionElementArray[i] = new Array();
	}
	
	for(var j=0; j<TOTAL_NUMBER_OF_FRETS; j++)
	{
		var element_neck_fret = document.createElement('table');
		element_neck_fret.className = "fret_table";
		for(var i=0; i<TOTAL_NUMBER_OF_STRINGS; i++)
		{
			element_neck_fret.appendChild(document.createElement('tr'));
			element_neck_fret.rows[i].appendChild(document.createElement('td'));
			element_neck_fret.rows[i].cells[0].style.width = windowWidth*0.1;
			element_neck_fret.rows[i].cells[0].style.height = windowHeight*0.0515;
			element_neck_fret.rows[i].cells[0].className = "position_td";

			var backgroundColor = 'white';
			// backgroundColor = "#fffe79";
			// backgroundColor = "#ff7979";

			element_neck_fret.rows[i].cells[0].style.backgroundColor = backgroundColor;
			element_neck_fret.rows[i].cells[0].style.boxShadow = "0px 0px 10px 3px "+ backgroundColor;
			
			element_neck_fret.rows[i].cells[0].style.fontSize = $(element_neck_fret.rows[i].cells[0]).height()*2 + "px";
			element_neck_fret.rows[i].cells[0].style.lineHeight = $(element_neck_fret.rows[i].cells[0]).height()*0.01+ "px";
			
			neckPositionElementArray[j][i] = element_neck_fret.rows[i].cells[0];
			//element_neck_fret.rows[i].cells[0].innerHTML = j;
			
			/*element_neck_fret.rows[i].cells[0].style.backgroundColor = randomColor();
			element_neck_fret.rows[i].cells[0].innerHTML = j+","+i;*/
		}
		document.body.appendChild(element_neck_fret);
		element_neck_fret.style.zIndex = 1;
		element_neck_fret.style.borderSpacing = windowHeight*0.018;
	}

	var neckTop = $(element_neck).position().top;
	var neckHeight = $(element_neck).height();
	var neckWidth = $(element_neck).width();
	for(var i=0; i<TOTAL_NUMBER_OF_FRETS; i++)
	{
		$(".fret_table")[i].style.left = ($($(".fret_table")[0]).width()/3)*(i+1)+(neckWidth/6)*i;
		$(".fret_table")[i].style.top = neckTop;
	}
}

function createStrings()
{
	var fretTable = $(".fret_table")[0];
	var stringsContainerElement = document.createElement('div');
	stringsContainerElement.style.position = 'absolute';
	stringsContainerElement.style.top = $(fretTable.rows[0]).offset().top;
	stringsContainerElement.style.left = 0;
	stringsContainerElement.style.width = $(window).width();
	
	document.body.appendChild(stringsContainerElement);
	for(var i=0; i<TOTAL_NUMBER_OF_STRINGS; i++)
	{
		stringElements[i] = document.createElement('div');
		stringElements[i].style.position = 'relative';

		stringElements[i].style.width = $(window).width();
		stringElements[i].style.height = $(fretTable.rows[0]).height()/9;
		if(i==0)
			$(stringElements[i]).css("margin-top", $(fretTable).height()/20);
		else
			$(stringElements[i]).css("margin-top", $(fretTable).height()/7);
		stringElements[i].style.zIndex = 1;
		stringElements[i].className = "string";
		stringElements[i].style.boxShadow = "0px 5px 10px 3px black";
		stringsContainerElement.appendChild(stringElements[i]);
	}
	
}

function randomColor()
{
	return Math.floor(Math.random()*16777215).toString(16);
}


function createElements()
{
	element_background.src = "back.png";
	document.body.appendChild(element_background);
	setPosition(element_background, 0, 0, 1, 1);

	element_title.innerHTML = document.getElementById('title').innerHTML;
	document.body.appendChild(element_title);
	setPosition(element_title, 0.25, 0.047, 0.48, 0.16);
	element_title.className = "text next";

	element_neck.src = "neck.png";
	document.body.appendChild(element_neck);
	setPosition(element_neck, 0, 0.22, 1, 0.42);
	element_neck.style.boxShadow = "0px 5px 3px black";

	element_bottom_stripe.src = "bottom_stripe.png";
	document.body.appendChild(element_bottom_stripe);
	setPosition(element_bottom_stripe, 0, 0.7, 1, 0.22);

	document.body.appendChild(element_chord);
	//element_chord.innerHTML = $(originalChordElementList)[currentChordIndex].innerHTML;
	setPosition(element_chord, 0.04, 0.64, 0.16, 0.28, 1.3);
	element_chord.className = "chord";

	document.body.appendChild(element_lyrics);
	//element_lyrics.innerHTML = $(originalLyricsElementList)[currentChordIndex].innerHTML;
	setPosition(element_lyrics, 0.2, 0.67, 0.79, 0.2);
	element_lyrics.className = "text";

	element_logo.src = "logo.png";
	document.body.appendChild(element_logo);
	setPosition(element_logo, 0.74, 0.047, 0.2, 0.15);

	document.body.appendChild(element_next);
	//element_next.innerHTML = $(originalChordElementList)[currentChordIndex+1].innerHTML;
	setPosition(element_next, 0.1, 0.03, 0.1, 0.15, 1.3);
	element_next.className = "next chord";
	
	/*
	 * PLAY 
	document.body.appendChild(element_play);
	element_play.innerHTML = "PLAY";
	setPosition(element_play, 0.5, 0.5, 0.7, 0.7);
	element_play.style.left = parseInt(element_play.style.left) - $(element_play).width()/2;
	element_play.style.top = parseInt(element_play.style.top) - $(element_play).height()/2;
	element_play.className = "play";
	*/
}

function getBestFitTextSize(element, optional_text)
{
	var returnedFontSize, currentFontSize = 5;
	var tryElement = document.createElement('span');
	if(optional_text==null)	tryElement.innerHTML = element.innerHTML;
	else					tryElement.innerHTML = optional_text;
	
	tryElement.style.fontSize = currentFontSize + "px";
	document.body.appendChild(tryElement);
	
	var error = 0;
	while($(tryElement).width()<$(element).width() && $(tryElement).height()<$(element).height())
	{
		if(error>100) break;
		error++;
		currentFontSize = currentFontSize + 5; 
		tryElement.style.fontSize = currentFontSize + "px";
	}
	
	returnedFontSize = tryElement.style.fontSize; 
	document.body.removeChild(tryElement);
	return returnedFontSize;
}

function setPosition(element, x, y, width, height)
{
	if(y!=null)
		element.style.left = x*windowWidth;
	if(x!=null)
		element.style.top = y*windowHeight;
	if(width!=null)
		element.style.width = (width*windowWidth);
	if(height!=null)
		element.style.height = (height*windowHeight);

	element.style.fontSize = getBestFitTextSize(element);
	
	//element.style.backgroundColor = randomColor();
	//element.style.border = "1px solid";
}

function loadScript(url, callback)
{
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}