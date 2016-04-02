function setNeckPositionOn(fret, string, leaveFingering)
{
	if(neckFrets==null) neckFrets = document.getElementsByClassName("fret_table");
	var position = neckPositionElementArray[fret-1][6-string]; 

	position.style.opacity = "1";
	//position.style.zIndex = 4;
	if(leaveFingering==false) position.innerHTML = "";
}

function setNeckPositionOff(fret, string, leaveFingering)
{
	if(neckFrets==null) neckFrets = document.getElementsByClassName("fret_table");
	var position = neckPositionElementArray[fret-1][6-string]; 

	position.style.opacity = "0.2";
	//position.style.zIndex = 1;
	if(leaveFingering==false) position.innerHTML = "";
	
}

function setNeckPositionBlinkOn(fret, string, leaveFingering)
{
	if(neckFrets==null) neckFrets = document.getElementsByClassName("fret_table");
	var position = neckPositionElementArray[fret-1][6-string]; 

	position.style.animation = "blink 0.1s linear 0s infinite";
	//position.style.zIndex = 1;
	if(leaveFingering==false) position.innerHTML = "";
	
}

function setNeckPositionBlinkOff(fret, string, leaveFingering)
{
	if(neckFrets==null) neckFrets = document.getElementsByClassName("fret_table");
	var position = neckPositionElementArray[fret-1][6-string]; 

	position.style.animation = "";
	//position.style.zIndex = 1;
	if(leaveFingering==false) position.innerHTML = "";
	
}







function setAllNeckPositionsOff(leaveFingering)
{
	if(neckPositions==null) neckPositions = document.getElementsByClassName("position_td");
	for(var fret=0; fret<TOTAL_NUMBER_OF_FRETS; fret++)
	{
		for(var string=0; string<TOTAL_NUMBER_OF_STRINGS; string++)
		{
			setNeckPositionOff(fret+1, string+1, leaveFingering);
		}
	}
}
function setAllNeckPositionsOn(leaveFingering)
{
	if(neckPositions==null) neckPositions = document.getElementsByClassName("position_td");
	for(var fret=0; fret<TOTAL_NUMBER_OF_FRETS; fret++)
	{
		for(var string=0; string<TOTAL_NUMBER_OF_STRINGS; string++)
		{
			setNeckPositionOn(fret+1, string+1, leaveFingering);
		}
	}
}
function setNeckPositionListOff(positionList)
{
	for(var i=0; i<positionList.length; i++)
	{
		setNeckPositionOff(positionList[i][0], positionList[i][1])
	}
}
function setNeckPositionListOn(positionList)
{
	for(var i=0; i<positionList.length; i++)
	{
		setNeckPositionOn(positionList[i][0], positionList[i][1])
	}
}

