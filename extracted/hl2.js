/*

	http://www.theskinsfactory.com

	info@theskinsfactory.com

	Half-Life 2 WMP Skin



*/



/*

	Copyright � 2003. The Skins Factory, Inc. All Rights Reserved.

	This code may not be reproduced in whole or in part without express permission of The Skins Factory, Inc.

*/



function onLoadPreview(){

	if(player){}

	view.width = 0;

	view.height = 0;

	view.backgroundImage = "";

	theme.currentViewID = "controlView";

}



function onLoadSkin()

{

	theme.savePreference("exitView", "false");



    if ("true"==theme.loadPreference("plViewer"))

	{

		theme.openView( 'plView' );

	}



	if ("true"==theme.loadPreference("eqViewer"))

	{

		theme.openView( 'eqView' );

	}



	if ("true"==theme.loadPreference("visViewer"))

	{

		theme.openView( 'visView' );

	}



	if ("true"==theme.loadPreference("infoViewer"))

	{

		theme.openView( 'infoView' );

	}



	theme.openView('mainView');



	checkControlPlayerState();

}



function checkViewStatus()

{

	if("true"==theme.loadPreference("remoteCallPl"))

	{

		toggleView('plView','plViewer')

		theme.savePreference("remoteCallPl", "false");

	}

	if("true"==theme.loadPreference("remoteCallEq"))

	{

		toggleView('eqView','eqViewer')

		theme.savePreference("remoteCallEq", "false");

	}

	if("true"==theme.loadPreference("remoteCallVis"))

	{

		toggleView('visView','visViewer')

		theme.savePreference("remoteCallVis", "false");

	}

	if("true"==theme.loadPreference("remoteCallInfo"))

	{

		toggleView('infoView','infoViewer')

		theme.savePreference("remoteCallInfo", "false");

	}



	if("true"==theme.loadPreference("minimizeView"))

	{

		view.minimize();

		theme.savePreference("minimizeView", "false");

	}

	if("true"==theme.loadPreference("exitView"))

	{

		

		view.close();

	}

}



function onCloseSkin()

{

	theme.savePreference("exitView", "false");

}



function checkControlPlayerState(){



	if (player){

		switch (player.playState){



			case 2:

			case 3: 	//playing



				if(("false"==theme.loadPreference("vidViewer"))&&player.currentMedia.ImageSourceWidth>0){

					theme.openView('videoView');

					/*if("true"==theme.loadPreference("visViewer")){

					    theme.savePreference("visViewer", "false");

						theme.closeView( "visView" );

					

					break}*/

				}

				break;

			}

		}

}





var frameCount = 1;



var shutterStatus = false;



var outerStatus = false;



var shutterPulse = false;



function toggleShutter()

{

	if(!shutterStatus)

	{

		if(!outerStatus)

		{

			outerShutterSub.backgroundImage = "shutter_out_open.gif";

			//outerShutterStatic.visible = false;

			view.TimerInterval = 1000;

			checkSoundPref('s_outer.wav');

			outerStatus = !outerStatus;

			return;

		}

		if(frameCount==1)checkSoundPref('s_trans.wav');

		frameCount++

		var frameStr = frameCount < 10 ? "0" + frameCount : "" + frameCount;

		topShutterSub.backgroundImage = "shutter_f" + frameStr + ".png";

		view.timerInterval = 50;

		if(frameCount==17)

		{

			checkSoundPref('s_inner2.wav');

			view.timerInterval = 0;

			centerShutterSub.backgroundImage = "shutter_open.gif";

			centerShutterSubStatic.visible = false;

			frameCount = 17;

			shutterStatus = !shutterStatus;

			shutterButton.enabled = true;

			mainBackFrame.visible = true;

			shutterButton.upToolTip = locShutterClose3.toolTip;

		}

		

	}

	else

	{



		if(shutterPulse)

		{

			view.timerInterval = 0;

			centerShutterSub.backgroundImage = "shutter_pulse.gif";

			//shutterStatus = !shutterStatus;

			outerStatus = !outerStatus;

			shutterPulse = !shutterPulse;

			shutterButton.upToolTip = locShutterClose1.toolTip;

			shutterButton.enabled = true;

			return;

		}



		if(!outerStatus)

		{

			outerShutterSub.backgroundImage = "shutter_out_close.gif";

			centerShutterSub.backgroundImage = "";

			//outerStatus = !outerStatus;

			shutterStatus = !shutterStatus;

			view.timerInterval = 0; 

			shutterButton.enabled = true;

			shutterButton.upToolTip = locShutterClose2.toolTip;

			checkSoundPref('s_outer.wav');

			return;

		}



		if(frameCount==1) 

		{

			view.timerInterval = 1800;

			centerShutterSub.backgroundImage = "shutter_close.gif";

			centerShutterSubStatic.visible = true;

			frameCount = 1;

			shutterPulse = !shutterPulse;

			mainBackFrame.visible = false;

			checkSoundPref('s_inner1.wav');

		}



		if(frameCount==1) return;

		if(frameCount==17)checkSoundPref('s_trans.wav');

		frameCount--

		var frameStr = frameCount < 10 ? "0" + frameCount : "" + frameCount;

		topShutterSub.backgroundImage = "shutter_f" + frameStr + ".png";

		view.timerInterval = 50;



	}

}



// sound fx



function loadSoundPrefValue(){

	var val = theme.loadPreference('soundFX');

	if(val=='--'){

		theme.savePreference("soundFX", "true");

	}

}



function checkSoundPref(type){

	if("true"==theme.loadPreference("soundFX")){

		theme.playSound( type );

	}

}



function mainStartUp(){

	volume.value = player.settings.volume;

	loadSoundPrefValue();

	loadMainPrefs();

	theme.savePreference("vidViewer", "false");

	checkPlayerState();

	updateMetadata('status');

}



function checkPlayerState(){



	if (player){

		switch (player.playState){



			case 2:

			case 3: 	//playing

/*

				if(("false"==theme.loadPreference("vidViewer"))&&player.currentMedia.ImageSourceWidth>0){

					theme.openView('videoView');

					if("true"==theme.loadPreference("visViewer")){

					    theme.savePreference("visViewer", "false");

						theme.closeView( "visView" );

					}

					break

				}

*/

				break;

			}

		}





	if (!player.controls.isAvailable("Stop")) {

		time.value = "00:00";

	}



}



// metadata



function updateMetadata(type){

	if("status"==type){

		if(player.openState!=13) return;



		var metaAuthor = player.currentMedia.getItemInfo("author");



		if (metaAuthor != "") {

			metaAuthor += " - ";

		}



		metadata.value = player.status;



		if (metadata.value != "") {

			metadata.value += " - ";

		}



		metadata.value += metaAuthor;

	}else if("playlist"==type){

		if(player.currentPlaylist.count==0) return;



		var metaAuthor = player.currentMedia.getItemInfo("author");



		if (metaAuthor != "") {

			metaAuthor += " - ";

		}



		if(player.openState!=13){

			metadata.value = metaAuthor;

		}

	}else{

		metadata.value = player.status;

		metadata.scrolling = (metadata.textWidth>metadata.width);

		return;

	}



	metadata.value += player.currentmedia.name;

	metadata.scrolling = (metadata.textWidth>metadata.width);



}





// button and hotkey definitions



// open file

function openFile()

{

	var media = theme.openDialog('FILE_OPEN','FILES_ALLMEDIA');

	if(media)

	{

		player.URL = media;

		player.controls.play();

	}

}



function viewHotKeys()

{

	switch(event.keycode)

	{

		case 122:

		case 90:

			player.controls.previous();

			break;

		case 120:

		case 88:

			player.controls.play();

			break;

		case 99:

		case 67:

			player.controls.pause();

			break;

		case 118:

		case 86:

			player.controls.stop();

			break;

		case 98:

		case 66:

			player.controls.next();

			break;

		case 108:

		case 76:

			openFile();

			break;

	}

}



function viewResizer(event)

{

	switch(event.keycode)

	{

		case 37:

			view.width-=20;

			break;

		case 38:

			view.height-=20

			break;

		case 39:

			view.width+=20;

			break;

		case 40:

			view.height+=20;

			break;

	}

}



function updateToolTip(id,button,tip)

{

	if("true"==theme.loadPreference( id ))

	{

		eval( button +".upToolTip = locHide" + tip + ".toolTip" );

	}

	else

	{

		eval( button +".upToolTip = locShow" + tip + ".toolTip" );

	}

}



function updateSeekToolTip()

{

	if(player.openState!=13) return;



	var seekHours = Math.floor((seek.value / 3600));

	if (seekHours < 10) seekHours = "0" + seekHours;



	var seekMinutes = Math.floor((seek.value - (seekHours*3600))/60);

	if (seekMinutes < 10) seekMinutes = "0" + seekMinutes;



	var seekSeconds = Math.floor((seek.value - (seekMinutes*60) - (seekHours*3600)));

	if (seekSeconds < 10) seekSeconds = "0" + seekSeconds;



	var seekString;



	if (seekHours==00)

	{

		seekString = "";

	}

	else

	{

		seekString = seekHours + ":";

	}



	seekString += seekMinutes + ":" + seekSeconds;



	seek.toolTip = seekString;

	seek.toolTip += " / ";

	seek.toolTip += player.currentMedia.DurationString;



}



function updateVolToolTip(id)

{

	vol = "";

	vol += player.settings.volume;

	eval(id + ".toolTip = vol" );

}



function updateShuffRep()

{

	if(player.settings.getMode('shuffle'))

	{

		shuffleButton.down = true;

	}else{

		shuffleButton.down = false;

	}



	if(player.settings.getMode('loop'))

	{

		repeatButton.down = true;

	}else{

		repeatButton.down = false;

	}

}



//



function volKey(event)

{

	switch(event.keycode)

	{

		case 39:

		case 38:

			if(player.settings.volume < 95)

			{

				player.settings.volume+=5;

			}else{

				player.settings.volume = 100;

			}

			break;

		case 37:

		case 40:

			if(player.settings.volume > 5)

			{

				player.settings.volume-=5;

			}else{

				player.settings.volume = 0;

			}

			break;

	}

	player.settings.mute = false;

}



function seekKey(event)

{

	if(player.openState!=13) return;

	switch(event.keycode)

	{

		case 37:

		case 38:

			if(player.controls.currentPosition > 10)

			{

				player.controls.currentPosition-=10;

			}else{

				player.controls.currentPosition = 0;

			}

			break;

		case 39:

		case 40:

			if(player.controls.currentPosition < player.currentMedia.duration)

			{

				player.controls.currentPosition+=10;

			}else{

				player.controls.currentPosition = player.currentMedia.duration;

			}

			break;

	}

}



// view toggle 



function toggleView(name,id)

{

	if("true"==theme.loadPreference(id))

	{

	    theme.savePreference(id, "false");

		theme.closeView( name );

	}else{

		theme.openView( name );

	}

}



function closeView(id)

{

	theme.savePreference(id, "false");

	if( id=="vidViewer" )

	{

		player.controls.stop();

		//theme.savePreference("vidCheck", "false");

		theme.savePreference("vidViewer", "false");

	}

	view.close();

}



function autoSizeView(width,height)

{

    var viewSize = theme.loadPreference( width );



    if( "--" != viewSize )

    {

        view.width = viewSize;

    }else{

		view.width = view.minWidth;

	}



    viewSize = theme.loadpreference( height );



    if( "--" != viewSize )

    {

        view.height = viewSize;

    }else{

		view.height = view.minHeight;

	}

}



function saveViewSize(width,height)

{

	theme.savepreference( width , view.width );

    theme.savepreference( height , view.height );

}







// preferences



function loadMainPrefs(){

	theme.savePreference("exitView", "false");

}



function saveMainPrefs() {

	theme.savePreference("exitView", "true");

}



function mainShutDown(){

	saveMainPrefs();

}



// playlist

function loadPlPrefs()

{

	theme.savePreference( 'plViewer', "true" );



	autoSizeView('plWidth','plHeight');



	var index = 0;



	playlist1.setColumnResizeMode( index++, "AutosizeData" );

    playlist1.setColumnResizeMode( index++, "Stretches" );

    playlist1.setColumnResizeMode( index++, "AutosizeHeader" );

    playlist1.setColumnResizeMode( index++, "AutosizeHeader" );

    playlist1.setColumnResizeMode( index++, "AutosizeHeader" );

	playlist1.setColumnResizeMode( index++, "AutosizeHeader" );



}



function savePlPrefs(){

	saveViewSize('plWidth','plHeight');

}





// eq settings

function loadEQPrefs(){

	theme.savePreference( 'eqViewer', "true" );

	view.width = view.minWidth;

	view.height = view.minHeight;



}



function updateBalToolTip(){

	balance.toolTip = "";

	balance.toolTip += player.settings.balance;

}



function toggleSkinFx(){

	if("true"==theme.loadPreference("soundFX")){

		theme.savePreference("soundFX", "false");

	}else{

		theme.savePreference("soundFX", "true");

	}

}



function toggleSpeaker(){

	if(eq.speakerSize==2){

		eq.speakerSize = -1;

	}

	eq.speakerSize++



}



// visualizations

function loadVisPrefs(){

	theme.savePreference( 'visViewer', "true" );

	visEffects.currentEffectType = mediacenter.effectType;

	visEffects.currentPreset = mediacenter.effectPreset;



	autoSizeView('visWidth','visHeight');



	checkVisualsPlayerState();

}



function saveVisPrefs(){

	mediacenter.effectType = visEffects.currentEffectType;

	mediacenter.effectPreset = visEffects.currentPreset;

	saveViewSize('visWidth','visHeight');

}



function checkVisualsPlayerState(){



	if (player){

		switch (player.playState){

			case 2:

			case 3: 	//playing

				//visMask.visible = true;

				if(player.currentMedia.ImageSourceWidth>0){

					theme.savePreference('visViewer', "false");

					view.close();

				}

				break;



			}

		}



	if (!player.controls.isAvailable("Stop")) {

		//visMask.visible = false;

	}

}



function displayVisText(){

	visEffectsText.visible = true;

	visEffectsText.value = visEffects.currentEffectTitle + ": " + visEffects.currentPresetTitle;

	visView.timerInterval = 6000

}



function hideVisText(){

	visEffectsText.visible = false;

	visView.timerInterval = 0

}



// video settings



function loadVidPrefs(){

	theme.savePreference( 'vidViewer', "true" );



	var _drawerStatus = theme.loadPreference('drawerStatus');



	if (_drawerStatus != '--') {

		drawerStatus = (_drawerStatus.toLowerCase() == 'true') ? false : true;

	} else {

		drawerStatus = true;

	}



	checkSnapStatus();

	checkVideoPlayerState();

	updateZoomToolTip();

	toggleVidDrawer();

}



function saveVidPrefs(){

	theme.savePreference('drawerStatus',drawerStatus);

}



function loadVidSize(){

    var vidSizer = theme.loadPreference( "videoWidth" );



    if( "--" != vidSizer )

    {

        view.width = vidSizer;

    }

    vidSizer = theme.loadpreference( "videoHeight" );



    if( "--" != vidSizer )

    {

        view.height = vidSizer;

    }

}



function saveVidSize(){

    theme.savepreference( "videoWidth", view.width );

    theme.savepreference( "videoHeight", view.height );

	theme.savePreference("vidSnapper" , "false");

	vidZoom.upToolTip = vidSetTip.toolTip;

	mediacenter.videoZoom = 50;

}



function videoZoom(){

	if("false"==theme.loadPreference("vidSnapper")){

		mediacenter.videoZoom = 50;

	}

	if(mediacenter.videoZoom < 76){

		mediacenter.videoZoom = 100;

	}else if(mediacenter.videoZoom <101){

		mediacenter.videoZoom = 150;

	}else if(mediacenter.videoZoom < 156){

		mediacenter.videoZoom = 200;

	}else{

		mediacenter.videoZoom = 75;

	}

	SnapToVideo();

	updateZoomToolTip();

}



function updateZoomToolTip(){



	vidZoom.upToolTip = vidZoomIn.toolTip + mediacenter.videoZoom + vidZoomMid.toolTip;



	if(mediacenter.videoZoom < 76){

		nextZoom = 100;

	}else if(mediacenter.videoZoom <101){

		nextZoom = 150;

	}else if(mediacenter.videoZoom < 156){

		nextZoom = 200;

	}else{

		nextZoom = 75;

	}



	vidZoom.upToolTip += nextZoom + vidZoomOut.toolTip;

	

	if("false"==theme.loadPreference("vidSnapper")){

		vidZoom.upToolTip = vidSetTip.toolTip;

	}

}



function SnapToVideo(){



	theme.savePreference("vidSnapper" , "true");



	var zoom = mediacenter.videoZoom;

	var viewWidth = (player.currentMedia.imageSourceWidth * (zoom/100.00));

	var viewHeight = (player.currentMedia.imageSourceHeight * (zoom/100.00));



	view.width = viewWidth + 64;

	view.height = viewHeight + 144;

}



function checkSnapStatus(){

	if(player.openState!=13) return;

	if("false"==theme.loadPreference("vidSnapper")){

		loadVidSize();

	}else{

		SnapToVideo();

	}

}



function checkVideoPlayerState(){

	if (player){

		switch (player.playState){

			

			case 3: 	//playing

				if(!player.currentMedia.ImageSourceWidth>0){

					theme.savePreference('vidViewer', "false");

					view.close();

					break;

				}

			//	vidBack.visible = false;

				videoFrame.visible = true;

				if(!player.fullScreen){

					checkSnapStatus();

				}

				break;

			case 8:

				return;

				break;

			}

			vidResize.enabled = true;

			vidZoom.enabled = true;

		}



	if (!player.controls.isAvailable("Stop")) {

		videoFrame.visible = false;

		vidResize.enabled = false;

		vidZoom.enabled = false;

	//	vidBack.visible = true;

		view.width = 393;

		view.height = 287;

	}

}



function toggleVidDrawer(){

	if(!drawerStatus){

		vidDrawer.moveTo(0,view.height-75,500);

		vidDrawerFrame.visible = true;

		vidDrawerButton.down = true;

		drawerStatus = !drawerStatus;

	}else{

		vidDrawer.moveTo(0,view.height-150,500);

		drawerStatus = !drawerStatus;

	}

}



function checkVidDrawer(){

	drawerStatus = drawerStatus;

	vidDrawerFrame.visible = drawerStatus;

}





function loadInfoPrefs(){

	theme.savePreference( 'infoViewer', "true" );

	//view.width = view.minWidth;

	//view.height = view.minHeight;



}



// nav menu



var infoGo = 0;



function showInfo(menu,nav,infoGo){

	infoMenuBack.visible = menu;

	infoNavSub.visible = nav;

	menuBackButtons.visible = false;

	//menuBack.visible = !menu;

	menuBack.backgroundImage = "c_back.jpg";

	switch(infoGo){

		case 0:

			//infoSub.backgroundImage = "";

		//	menuBack.visible = true;

			menuBackButtons.visible = true;

			infoSub.alphaBlendTo(0,500);

			link1.visible = false;

			break;

		case 1:

			infoMode = 1;	// info

			navGo = 1;

			navLimit = 8;

			infoNavNext();

			break;

		case 2:

			infoMode = 2;	// images

			navGo = 1;

			navLimit = 8;

			infoNavNext();

			break;

		case 3:

			infoMode = 3;	// images

			navGo = 1;

			navLimit = 1;

			//link1.visible = true;

			infoNavNext();

			break;

	}

}



navGo = 1;



function infoNavNext(){
	// HIDE FIRST - occlude before loading new image
	infoSub.alphaBlend = 0;

	// Set artwork
	infoSub.backgroundImage = "c_sub_" + infoMode + "_" + navGo + ".jpg";

	// FORCE RESCALE - trigger resize event immediately
	forceInfoSubRescale();

	// Update nav button states
	navCheck();

	// Fade in (fast 150ms)
	infoSub.alphaBlendTo(255, 150);
}



function infoNavPrev(){
	// HIDE FIRST - occlude before loading new image
	infoSub.alphaBlend = 0;

	// Set artwork
	infoSub.backgroundImage = "c_sub_" + infoMode + "_" + navGo + ".jpg";

	// FORCE RESCALE - trigger resize event immediately
	forceInfoSubRescale();

	// Update nav button states
	navCheck();

	// Fade in (fast 150ms)
	infoSub.alphaBlendTo(255, 150);
}



function navCheck(){

	if(navGo==1){

		navPrev.enabled = false;

		navNext.enabled = true;

	}else if(navGo==navLimit && infoMode==infoMode){	// enable / disable sections

		navNext.enabled = false;

		navPrev.enabled = true;

	}else{

		navNext.enabled = true;

		navPrev.enabled = true;

	}
}



function endAlphaBlend(){

	if(infoMode==3&&infoSub.alphaBlend==255)link1.visible = true;

	if(infoSub.alphaBlend==0)return;

	menuBack.backgroundImage = infoSub.backgroundImage;

	

}

// ============== INFO PANEL FIXED RATIO RESIZE ==============
var INFO_BASE_W = 283;
var INFO_BASE_H = 388;
// Content image dimensions (c_back.jpg, artwork, screenshots)
var CONTENT_W = 217;
var CONTENT_H = 302;
var CONTENT_RATIO = CONTENT_W / CONTENT_H;  // 0.7185
// Frame fixed margins (from nineGridMargins)
var FRAME_LEFT = 34, FRAME_TOP = 48, FRAME_RIGHT = 40, FRAME_BOTTOM = 55;
var FRAME_H_MARGIN = FRAME_LEFT + FRAME_RIGHT;  // 74
var FRAME_V_MARGIN = FRAME_TOP + FRAME_BOTTOM;  // 103

function infoResize() {
    // Enforce aspect ratio on CONTENT area, not overall view
    var contentW = view.width - FRAME_H_MARGIN;
    var contentH = view.height - FRAME_V_MARGIN;
    var currentRatio = contentW / contentH;

    if (currentRatio > CONTENT_RATIO) {
        // Too wide - adjust width
        contentW = Math.round(contentH * CONTENT_RATIO);
        view.width = contentW + FRAME_H_MARGIN;
    } else if (currentRatio < CONTENT_RATIO) {
        // Too tall - adjust height
        contentH = Math.round(contentW / CONTENT_RATIO);
        view.height = contentH + FRAME_V_MARGIN;
    }

    var s = view.width / INFO_BASE_W;

    // Frame has fixed margins (nineGridMargins): left=34, top=48, right=40, bottom=55
    // Content area fills the space between these fixed borders
    var frameLeft = 34;
    var frameTop = 48;
    var frameRight = 40;
    var frameBottom = 55;
    var overlap = 6;  // Extend under frame edge to hide gaps
    var bottomExtra = 20;  // Extra coverage at bottom to prevent pink

    var contentLeft = frameLeft - overlap;
    var contentTop = frameTop - overlap;
    var contentWidth = view.width - frameLeft - frameRight + (overlap * 2);
    var contentHeight = view.height - frameTop - frameBottom + (overlap * 2) + bottomExtra;

    // menuBack - fills content area
    menuBack.left = contentLeft;
    menuBack.top = contentTop;
    menuBack.width = contentWidth;
    menuBack.height = contentHeight;

    // infoSub - same as menuBack
    var targetW = contentWidth;
    var targetH = contentHeight;
    infoSub.left = contentLeft;
    infoSub.top = contentTop;
    // Jiggle +1 then set correct - triggers resize event
    infoSub.width = targetW + 1;
    infoSub.height = targetH + 1;
    infoSub.width = targetW;
    infoSub.height = targetH;

    // Menu buttons container - MUST overlay background text EXACTLY
    // Original: menuBack=217x302, buttons at (4,199) with size 208x100
    // Use fixed RATIOS so they always align regardless of size
    var btnRatioX = 4 / 217;      // 0.0184
    var btnRatioY = 199 / 302;    // 0.659
    var btnRatioW = 208 / 217;    // 0.958
    var btnRatioH = 100 / 302;    // 0.331

    menuBtnContainer.left = menuBack.left + Math.round(menuBack.width * btnRatioX);
    menuBtnContainer.top = menuBack.top + Math.round(menuBack.height * btnRatioY);
    menuBtnContainer.width = Math.round(menuBack.width * btnRatioW);
    menuBtnContainer.height = Math.round(menuBack.height * btnRatioH);

    // X button - fixed size, position anchored to top-right
    closeButton.width = 68;
    closeButton.height = 23;
    closeButton.left = view.width - 68 - 8;  // 8px from right edge
    closeButton.top = 5;

    // Resize handle - fixed size, anchored to bottom-right corner
    resizeHandle.width = 34;
    resizeHandle.height = 30;
    resizeHandle.left = view.width - 34;
    resizeHandle.top = view.height - 30;

    // Return button
    infoMenuBack.left = Math.round(37 * s);
    infoMenuBack.top = Math.round(331 * s);
    infoMenuBack.width = Math.round(58 * s);
    infoMenuBack.height = Math.round(16 * s);

    // Nav buttons
    infoNavSub.left = Math.round(200 * s);
    infoNavSub.top = Math.round(332 * s);
    infoNavSub.width = Math.round(47 * s);
    infoNavSub.height = Math.round(17 * s);
    var navScale = infoNavSub.width / 47;
    navPrev.left = 0;
    navPrev.width = Math.round(19 * navScale);
    navPrev.height = infoNavSub.height;
    navNext.left = Math.round(28 * navScale);
    navNext.width = Math.round(19 * navScale);
    navNext.height = infoNavSub.height;

    // Link panel
    link1.left = Math.round(49 * s);
    link1.top = Math.round(168 * s);
    link1.width = Math.round(185 * s);
    link1.height = Math.round(61 * s);
}

// Force rescale helper - call after setting new image
function forceInfoSubRescale() {
    // Match infoResize frame margins exactly
    var overlap = 6;
    var bottomExtra = 20;
    var contentLeft = 34 - overlap;
    var contentTop = 48 - overlap;
    var targetW = view.width - 34 - 40 + (overlap * 2);
    var targetH = view.height - 48 - 55 + (overlap * 2) + bottomExtra;

    // Set position first
    infoSub.left = contentLeft;
    infoSub.top = contentTop;

    // Jiggle size to trigger resize event
    infoSub.width = targetW + 1;
    infoSub.height = targetH + 1;
    infoSub.width = targetW;
    infoSub.height = targetH;
}
// ============== END INFO PANEL RESIZE ==============








