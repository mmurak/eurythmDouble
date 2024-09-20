// module
import WaveSurfer from 'https://cdn.jsdelivr.net/npm/wavesurfer.js@7/dist/wavesurfer.esm.js';
import TimelinePlugin from 'https://unpkg.com/wavesurfer.js@7.8.6/dist/plugins/timeline.js'
import { FieldEnabler } from "./FieldEnabler.js";

class GlobalManager {
	constructor() {
		// Part A
		this.inputFile = document.getElementById("InputFile");
		this.timerField = document.getElementById("TimerField");
		this.totalDuration = document.getElementById("TotalDuration");
		this.zoomIn = document.getElementById("ZoomIn");
		this.zoomOut = document.getElementById("ZoomOut");
		this.repeatablePlay = document.getElementById("RepeatablePlay");
		this.playPause = document.getElementById("PlayPause");
		this.speedHeader = document.getElementById("SpeedHeader");
		this.speedDigits = document.getElementById("SpeedDigits");
		this.speedVal = document.getElementById("SpeedVal");
		this.defaultSpeed = document.getElementById("DefaultSpeed");
		this.jumpSelector = document.getElementById("JumpSelector");
		this.leftArrowButton = document.getElementById("LeftArrowButton");
		this.rightArrowButton = document.getElementById("RightArrowButton");

		this.wavePlayer = null;

		this.currentZoomFactor = 10;
		this.minimumZoomFactor = 10;
		this.zoomDelta = 10;
		this.storedZoomFactor = 10;

		this.startPointStorage = 0;
		this.inHoldPlay = false;

		this.speedStorage = 1;
		this.defaultSpeedLabel = "1x Speed";

		this.fieldEnabler = new FieldEnabler([
			"InputFile",
			"PlayPause",
			"RepeatablePlay",
			"SpeedHeader",
			"SpeedVal",
			"DefaultSpeed",
			"RightArrowButton",
			"LeftArrowButton",
		]);

		this.fieldEnabler.setEnable([
			"InputFile",
		]);

		// Part B
		this.inputFileB = document.getElementById("InputFileB");
		this.timerFieldB = document.getElementById("TimerFieldB");
		this.totalDurationB = document.getElementById("TotalDurationB");
		this.zoomInB = document.getElementById("ZoomInB");
		this.zoomOutB = document.getElementById("ZoomOutB");
		this.repeatablePlayB = document.getElementById("RepeatablePlayB");
		this.playPauseB = document.getElementById("PlayPauseB");
		this.speedHeaderB = document.getElementById("SpeedHeaderB");
		this.speedDigitsB = document.getElementById("SpeedDigitsB");
		this.speedValB = document.getElementById("SpeedValB");
		this.defaultSpeedB = document.getElementById("DefaultSpeedB");
		this.jumpSelectorB = document.getElementById("JumpSelectorB");
		this.leftArrowButtonB = document.getElementById("LeftArrowButtonB");
		this.rightArrowButtonB = document.getElementById("RightArrowButtonB");

		this.wavePlayerB = null;

		this.currentZoomFactorB = 10;
		this.minimumZoomFactorB = 10;
		this.zoomDeltaB = 10;
		this.storedZoomFactorB = 10;

		this.startPointStorageB = 0;
		this.inHoldPlayB = false;

		this.speedStorageB = 1;
		this.defaultSpeedLabel = "1x Speed";

		this.fieldEnablerB = new FieldEnabler([
			"InputFileB",
			"PlayPauseB",
			"RepeatablePlayB",
			"SpeedHeaderB",
			"SpeedValB",
			"DefaultSpeedB",
			"RightArrowButtonB",
			"LeftArrowButtonB",
		]);

		this.fieldEnablerB.setEnable([
			"InputFileB",
		]);

		// Common definitions
		this.wavesurferHeight = 150;
	}
}
const G = new GlobalManager();

/*
 * waveSurfer section Part A
 */

// File input
G.inputFile.addEventListener("change", (e) => {
	let file = G.inputFile.files[0];
	if (file) {
		if (G.wavePlayer != null) {
			G.wavePlayer.destroy();
		}
		G.wavePlayer = WaveSurfer.create({
			container: '#waveform',
			waveColor: '#00BFFF',
			progressColor: '#87CEBB',
			height: G.wavesurferHeight,
		});
		G.wavePlayer.registerPlugin(TimelinePlugin.create({
			secondaryLabelOpacity: 1,
		}));
		G.wavePlayer.on("ready", () => {
			readyCB();
		});
		G.wavePlayer.on("play", () => {
			playCB();
		});
		G.wavePlayer.on("pause", () => {
			pauseCB();
		});
		G.wavePlayer.on("timeupdate", (time) => {
			updateProgressFromSec(time);
		});
		const url = URL.createObjectURL(file);
		G.wavePlayer.load(url);
		G.fieldEnabler.setEnable([
			"InputFile",
		]);
	}
});

G.inputFile.addEventListener("focus", () => {G.inputFile.blur()});	// this is to prevent activation by key-input.

// Play/Pause control
G.playPause.addEventListener("click", playPauseControl);

// Repeatable Play control
G.repeatablePlay.addEventListener("mousedown", repeatablePlayStart);
G.repeatablePlay.addEventListener("mouseup", repeatablePlayEnd);
G.repeatablePlay.addEventListener("mouseleave", repeatablePlayEnd);

// Reset play speed
G.defaultSpeed.addEventListener("click", resetPlaySpeed);

// Change play speed
G.speedVal.addEventListener("input", _changePlaySpeed);
function _changePlaySpeed() {
	const sp = Number(G.speedVal.value).toFixed(2);
	G.speedDigits.innerHTML = sp;
	if (sp != 1) {
		G.speedStorage = sp;
		G.defaultSpeed.value = G.defaultSpeedLabel;
	}
	G.wavePlayer.setPlaybackRate(G.speedVal.value, true);
}
G.speedVal.addEventListener("focus", () => { G.speedVal.blur(); });

G.jumpSelector.addEventListener("change", (evt) => {
	evt.preventDefault();
});

G.leftArrowButton.addEventListener("click", leftButtonClick);
G.rightArrowButton.addEventListener("click", rightButtonClick);

G.zoomIn.addEventListener("click", (evt) => { processZoomIn(evt); });
function processZoomIn(evt) {
	G.zoomOut.disabled = false;
	if (evt.shiftKey) {
		G.currentZoomFactor = G.storedZoomFactor;
	} else {
		G.currentZoomFactor += G.zoomDelta;
		G.storedZoomFactor = G.currentZoomFactor;
	}
	G.wavePlayer.zoom(G.currentZoomFactor);
	G.wavePlayer.setTime(G.wavePlayer.getCurrentTime());
}

G.zoomOut.addEventListener("click", (evt) => { processZoomOut(evt); });
function processZoomOut(evt) {
	if (G.currentZoomFactor > G.minimumZoomFactor) {
		if (evt.shiftKey) {
			G.storedZoomFactor = G.currentZoomFactor;
			G.currentZoomFactor = G.minimumZoomFactor;
		} else {
			G.currentZoomFactor -= G.zoomDelta;
		}
		G.wavePlayer.zoom(G.currentZoomFactor);
		G.wavePlayer.setTime(G.wavePlayer.getCurrentTime());
		if (G.currentZoomFactor == G.minimumZoomFactor) {
			G.zoomOut.disabled = true;
		}
	}
}

// Callback functions (for fieldEnabler)
function readyCB() {
	G.fieldEnabler.setEnable([
		"InputFile",
		"PlayPause",
		"RepeatablePlay",
		"SpeedHeader",
		"SpeedVal",
		"DefaultSpeed",
		"LeftArrowButton",
		"RightArrowButton",
	]);
	G.zoomIn.disabled = false;
	G.zoomOut.disabled = true;

	G.currentZoomFactor = Math.trunc(window.innerWidth / G.wavePlayer.getDuration());
	if (G.currentZoomFactor < 1)
		G.currentZoomFactor = 1;
	G.minimumZoomFactor = G.currentZoomFactor;
	G.zoomDelta = G.currentZoomFactor;
	G.storedZoomFactor = G.currentZoomFactor;
	G.wavePlayer.zoom(G.currentZoomFactor);

	G.speedVal.value = 1.0;
	G.defaultSpeed.value = G.defaultSpeedLabel;
	G.speedDigits.innerHTML = Number(G.speedVal.value).toFixed(2);
	G.totalDuration.innerHTML = convertTimeRep(G.wavePlayer.getDuration());
	G.speedStorage = 1;
}

function playCB() {
	G.fieldEnabler.setEnable([
		"PlayPause",
		"RepeatablePlay",
		"SpeedHeader",
		"SpeedVal",
		"DefaultSpeed",
		"LeftArrowButton",
		"RightArrowButton",
	]);
	if (G.inHoldPlay) {
		G.playPause.value = "Release to Pause →";
	} else {
		G.playPause.value = "Pause";
	}
}
function pauseCB() {
	G.fieldEnabler.setEnable([
		"InputFile",
		"PlayPause",
		"RepeatablePlay",
		"SpeedHeader",
		"SpeedVal",
		"DefaultSpeed",
		"LeftArrowButton",
		"RightArrowButton",
	]);
	G.playPause.value = "Play";
}

function playPauseControl() {
	if (G.wavePlayer.isPlaying()) {
		G.wavePlayer.pause();
	} else {
		G.wavePlayer.play();
	}
}

function repeatablePlayStart() {
	G.inHoldPlay = true;
	G.startPointStorage = G.wavePlayer.getCurrentTime();
	G.wavePlayer.play();
}

function repeatablePlayEnd() {
	if (G.inHoldPlay == false) return;
	G.wavePlayer.pause();
	G.wavePlayer.setTime(G.startPointStorage);
	G.inHoldPlay = false;
}

function resetPlaySpeed() {
	if (G.speedVal.value == 1.0) {
		G.speedVal.value = G.speedStorage;
		G.defaultSpeed.value = G.defaultSpeedLabel;
	} else {
		G.speedVal.value = 1.0;
		G.defaultSpeed.value = G.speedStorage + "x Speed";
	}
	G.speedVal.dispatchEvent(new Event("input"));
}

function leftButtonClick() {
	G.wavePlayer.setTime(G.wavePlayer.getCurrentTime() - Number(G.jumpSelector.value));
}

function rightButtonClick() {
	G.wavePlayer.setTime(G.wavePlayer.getCurrentTime() + Number(G.jumpSelector.value));
}

function updateProgressFromSec(time) {
	G.timerField.innerHTML = convertTimeRep(time);
}

/*
 * waveSurfer section Part B
 */

// File input
G.inputFileB.addEventListener("change", (e) => {
	let file = G.inputFileB.files[0];
	if (file) {
		if (G.wavePlayerB != null) {
			G.wavePlayerB.destroy();
		}
		G.wavePlayerB = WaveSurfer.create({
			container: '#waveformB',
			waveColor: '#00BFFF',
			progressColor: '#87CEBB',
			height: G.wavesurferHeight,
		});
		G.wavePlayerB.registerPlugin(TimelinePlugin.create({
			secondaryLabelOpacity: 1,
		}));
		G.wavePlayerB.on("ready", () => {
			readyCBB();
		});
		G.wavePlayerB.on("play", () => {
			playCBB();
		});
		G.wavePlayerB.on("pause", () => {
			pauseCBB();
		});
		G.wavePlayerB.on("timeupdate", (time) => {
			updateProgressFromSecB(time);
		});
		const url = URL.createObjectURL(file);
		G.wavePlayerB.load(url);
		G.fieldEnablerB.setEnable([
			"InputFileB",
		]);
	}
});

G.inputFileB.addEventListener("focus", () => {G.inputFileB.blur()});	// this is to prevent activation by key-input.

// Play/Pause control
G.playPauseB.addEventListener("click", playPauseControlB);

// Repeatable Play control
G.repeatablePlayB.addEventListener("mousedown", repeatablePlayStartB);
G.repeatablePlayB.addEventListener("mouseup", repeatablePlayEndB);
G.repeatablePlayB.addEventListener("mouseleave", repeatablePlayEndB);

// Reset play speed
G.defaultSpeedB.addEventListener("click", resetPlaySpeedB);

// Change play speed
G.speedValB.addEventListener("input", _changePlaySpeedB);
function _changePlaySpeedB() {
	const sp = Number(G.speedValB.value).toFixed(2);
	G.speedDigitsB.innerHTML = sp;
	if (sp != 1) {
		G.speedStorageB = sp;
		G.defaultSpeedB.value = G.defaultSpeedLabel;
	}
	G.wavePlayerB.setPlaybackRate(G.speedValB.value, true);
}
G.speedValB.addEventListener("focus", () => { G.speedValB.blur(); });

G.jumpSelectorB.addEventListener("change", (evt) => {
	evt.preventDefault();
});

G.leftArrowButtonB.addEventListener("click", leftButtonClickB);
G.rightArrowButtonB.addEventListener("click", rightButtonClickB);

G.zoomInB.addEventListener("click", (evt) => { processZoomInB(evt); });
function processZoomInB(evt) {
	G.zoomOutB.disabled = false;
	if (evt.shiftKey) {
		G.currentZoomFactorB = G.storedZoomFactorB;
	} else {
		G.currentZoomFactorB += G.zoomDeltaB;
		G.storedZoomFactorB = G.currentZoomFactorB;
	}
	G.wavePlayerB.zoom(G.currentZoomFactorB);
	G.wavePlayerB.setTime(G.wavePlayerB.getCurrentTime());
}

G.zoomOutB.addEventListener("click", (evt) => { processZoomOutB(evt); });
function processZoomOutB(evt) {
	if (G.currentZoomFactorB > G.minimumZoomFactorB) {
		if (evt.shiftKey) {
			G.storedZoomFactorB = G.currentZoomFactorB;
			G.currentZoomFactorB = G.minimumZoomFactorB;
		} else {
			G.currentZoomFactorB -= G.zoomDeltaB;
		}
		G.wavePlayerB.zoom(G.currentZoomFactorB);
		G.wavePlayerB.setTime(G.wavePlayerB.getCurrentTime());
		if (G.currentZoomFactorB == G.minimumZoomFactorB) {
			G.zoomOutB.disabled = true;
		}
	}
}

// Callback functions (for fieldEnabler)
function readyCBB() {
	G.fieldEnablerB.setEnable([
		"InputFileB",
		"PlayPauseB",
		"RepeatablePlayB",
		"SpeedHeaderB",
		"SpeedValB",
		"DefaultSpeedB",
		"LeftArrowButtonB",
		"RightArrowButtonB",
	]);
	G.zoomInB.disabled = false;
	G.zoomOutB.disabled = true;

	G.currentZoomFactorB = Math.trunc(window.innerWidth / G.wavePlayerB.getDuration());
	if (G.currentZoomFactorB < 1)
		G.currentZoomFactorB = 1;
	G.minimumZoomFactorB = G.currentZoomFactorB;
	G.zoomDeltaB = G.currentZoomFactorB;
	G.storedZoomFactorB = G.currentZoomFactorB;
	G.wavePlayerB.zoom(G.currentZoomFactorB);

	G.speedValB.value = 1.0;
	G.defaultSpeedB.value = G.defaultSpeedLabel;
	G.speedDigitsB.innerHTML = Number(G.speedValB.value).toFixed(2);
	G.totalDurationB.innerHTML = convertTimeRep(G.wavePlayerB.getDuration());
	G.speedStorageB = 1;
}

function playCBB() {
	G.fieldEnablerB.setEnable([
		"PlayPauseB",
		"RepeatablePlayB",
		"SpeedHeaderB",
		"SpeedValB",
		"DefaultSpeedB",
		"LeftArrowButtonB",
		"RightArrowButtonB",
	]);
	if (G.inHoldPlayB) {
		G.playPauseB.value = "Release to Pause →";
	} else {
		G.playPauseB.value = "Pause";
	}
}
function pauseCBB() {
	G.fieldEnablerB.setEnable([
		"InputFileB",
		"PlayPauseB",
		"RepeatablePlayB",
		"SpeedHeaderB",
		"SpeedValB",
		"DefaultSpeedB",
		"LeftArrowButtonB",
		"RightArrowButtonB",
	]);
	G.playPauseB.value = "Play";
}

function playPauseControlB() {
	if (G.wavePlayerB.isPlaying()) {
		G.wavePlayerB.pause();
	} else {
		G.wavePlayerB.play();
	}
}

function repeatablePlayStartB() {
	G.inHoldPlayB = true;
	G.startPointStorageB = G.wavePlayerB.getCurrentTime();
	G.wavePlayerB.play();
}

function repeatablePlayEndB() {
	if (G.inHoldPlayB == false) return;
	G.wavePlayerB.pause();
	G.wavePlayerB.setTime(G.startPointStorageB);
	G.inHoldPlayB = false;
}

function resetPlaySpeedB() {
	if (G.speedValB.value == 1.0) {
		G.speedValB.value = G.speedStorageB;
		G.defaultSpeedB.value = G.defaultSpeedLabel;
	} else {
		G.speedValB.value = 1.0;
		G.defaultSpeedB.value = G.speedStorageB + "x Speed";
	}
	G.speedValB.dispatchEvent(new Event("input"));
}

function leftButtonClickB() {
	G.wavePlayerB.setTime(G.wavePlayerB.getCurrentTime() - Number(G.jumpSelectorB.value));
}

function rightButtonClickB() {
	G.wavePlayerB.setTime(G.wavePlayerB.getCurrentTime() + Number(G.jumpSelectorB.value));
}

function updateProgressFromSecB(time) {
	G.timerFieldB.innerHTML = convertTimeRep(time);
}

//-------------------- Common logics --------------------

document.addEventListener("keydown", (evt) => {
	if (G.playPause.disabled)  return;
	if (evt.key == " ") {
		playPauseControl();
		evt.preventDefault();
	} else if (evt.key == "ArrowLeft") {
		leftButtonClick();
	} else if (evt.key == "ArrowRight") {
		rightButtonClick();
	} else if ((evt.key >= "1") && (evt.key <= 9)) {
		let delta = (evt.ctrlKey) ? Number(evt.key) : -Number(evt.key);
		G.wavePlayer.setTime(G.wavePlayer.getCurrentTime() + delta);
	} else if (evt.key == "ArrowUp") {
		G.speedVal.value = Number(G.speedVal.value) + 0.05;
		_changePlaySpeed();
	} else if (evt.key == "ArrowDown") {
		G.speedVal.value = Number(G.speedVal.value) - 0.05;
		_changePlaySpeed();
	} else if ((evt.key == "d") || (evt.key == "D")) {
		resetPlaySpeed();
	} else if ((evt.key == "i") || (evt.key == "I")) {
		processZoomIn(evt);
	} else if ((evt.key == "o") || (evt.key == "O")) {
		processZoomOut(evt);
	}
});

function convertTimeRep(time) {
	let formattedTime = [
		Math.floor(time / 60), // minutes
		Math.floor(time % 60), // seconds
	].map((v) => (v < 10 ? '0' + v : v)).join(':');
	formattedTime += "." + ("" + Math.trunc(time * 100) % 100).padStart(2, "0");
	return formattedTime;
}

function timeRepToSec(str) {
	const seg = str.split(":");
	return Number(seg[0]) * 60 + Number(seg[1]);
}

