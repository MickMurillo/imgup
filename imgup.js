/*
 * cropper.js -- v0.1
 * Copyright 2012 Oscar Key
 * A simple image cropping library which uses pure Javascript and the <canvas> tag in order to crop images in the browser.
 */

/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var imagesize;
var imagewidth;
var imageheight;

(function(cropper, undef) {
  "use strict"; // helps us catch otherwise tricky bugs

  var newWidth = 88;
  var newHeight = 88;

  /* DRAWING STUFF */
  var canvas;
  var context;

  var image;
  var restoreImage;
  var currentDimens = {};
  var cropping = false;

  var colors = {
    white: "#ffffff",
    black: "#000000",
    overlay: "rgba(0, 0, 0, 0.6)"
  };

  var overlay;

  function draw() {
    // clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // if we don't have an image file, abort the draw at this point
    if (image === undef) {
      return;
    }

    // draw the image
    var dimens = currentDimens;
    context.drawImage(image, 0, 0, dimens.width, dimens.height);

    // draw cropping stuff if we are cropping
    if (cropping) {
      // draw the overlay
      drawOverlay();

      // draw the resizer
      var x = overlay.x + overlay.width - 5,
        y = overlay.y + overlay.height - 5,
        w = overlay.resizerSide,
        h = overlay.resizerSide;

      context.save();
      context.fillStyle = colors.black;
      context.strokeStyle = colors.white;
      context.fillRect(x, y, w, h);
      context.strokeRect(x, y, w, h);
      context.restore();
    }
  }

  function drawOverlay() {
    // draw the overlay using a path made of 4 trapeziums (ahem)
    context.save();

    context.fillStyle = colors.overlay;
    context.beginPath();

    context.moveTo(0, 0);
    context.lineTo(overlay.x, overlay.y);
    context.lineTo(overlay.x + overlay.width, overlay.y);
    context.lineTo(canvas.width, 0);

    context.moveTo(canvas.width, 0);
    context.lineTo(overlay.x + overlay.width, overlay.y);
    context.lineTo(overlay.x + overlay.width, overlay.y + overlay.height);
    context.lineTo(canvas.width, canvas.height);

    context.moveTo(canvas.width, canvas.height);
    context.lineTo(overlay.x + overlay.width, overlay.y + overlay.height);
    context.lineTo(overlay.x, overlay.y + overlay.height);
    context.lineTo(0, canvas.height);

    context.moveTo(0, canvas.height);
    context.lineTo(overlay.x, overlay.y + overlay.height);
    context.lineTo(overlay.x, overlay.y);
    context.lineTo(0, 0);

    context.fill();

    context.restore();
  }

  function setRatio(ratio) {
    overlay.ratioXY = ratio;
    overlay.height = Math.floor(overlay.width * ratio);
  }

  function getScaledImageDimensions(width, height) {
    // choose the dimension to scale to, depending on which is "more too big"
    var factor = 1;
    if ((canvas.width - width) < (canvas.height - height)) {
      // scale to width
      factor = canvas.width / width;
    } else {
      // scale to height
      factor = canvas.height / height;
    }
    // important "if,else" not "if,if" otherwise 1:1 images don't scale

    var dimens = {
      width: Math.floor(width * factor),
      height: Math.floor(height * factor),
      factor: factor
    };

    return dimens;
  }

  function getTouchPos(touchEvent) {
    var rect = canvas.getBoundingClientRect();

    return {
      x: touchEvent.touches[0].clientX - rect.left,
      y: touchEvent.touches[0].clientY - rect.top
    };
  }
  /**
   * @param {Number} x position mouse / touch client event
   * @param {Number} y position mouse / touch client event
   */
  function getClickPos({
    x,
    y
  }) {
    return {
      x: x - window.scrollX,
      y: y - window.scrollY
    };
  }

  function isInOverlay(x, y) {
    return x > overlay.x && x < (overlay.x + overlay.width) && y > overlay.y && y < (overlay.y + overlay.height);
  }

  function isInHandle(x, y) {
    return x > (overlay.x + overlay.width - overlay.resizerSide) && x < (overlay.x + overlay.width + overlay.resizerSide) && y > (overlay.y + overlay.height - overlay.resizerSide) && y < (overlay.y + overlay.height + overlay.resizerSide);
  }

  /* EVENT LISTENER STUFF */
  var drag = {
    type: "", // options: "moveOverlay", "resizeOverlay"
    inProgress: false,
    originalOverlayX: 0,
    originalOverlayY: 0,
    originalX: 0,
    originalY: 0,
    originalOverlayWidth: 0,
    originalOverlayHeight: 0
  };

  /**
   * @param {Number} x position mouse / touch client event
   * @param {Number} y position mouse / touch client event
   */
  function initialCropOrMoveEvent({
    x,
    y
  }) {
    // if the mouse clicked in the overlay
    if (isInOverlay(x, y)) {
      drag.type = "moveOverlay";
      drag.inProgress = true;
      drag.originalOverlayX = x - overlay.x;
      drag.originalOverlayY = y - overlay.y;
    }

    if (isInHandle(x, y)) {
      drag.type = "resizeOverlay";
      drag.inProgress = true;
      drag.originalX = x;
      drag.originalY = y;
      drag.originalOverlayWidth = overlay.width;
      drag.originalOverlayHeight = overlay.height;
    }
  }

  /**
   * @param {Number} x horizontal position mouse or touch event
   * @param {Number} y vertical position mour or touch event
   * @description this function will be crop image inside canvas
   */
  function startCropOrMoveEvent({
    x,
    y
  }) {

    // Set current cursor as appropriate
    if (isInHandle(x, y) || (drag.inProgress && drag.type === "resizeOverlay")) {
      canvas.style.cursor = 'nwse-resize';
    } else if (isInOverlay(x, y)) {
      canvas.style.cursor = 'move';
    } else {
      canvas.style.cursor = 'auto';
    }

    // give up if there is no drag in progress
    if (!drag.inProgress) {
      return;
    }

    // check what type of drag to do
    if (drag.type === "moveOverlay") {
      overlay.x = x - drag.originalOverlayX;
      overlay.y = y - drag.originalOverlayY;

      // Limit to size of canvas.
      var xMax = canvas.width - overlay.width;
      var yMax = canvas.height - overlay.height;

      if (overlay.x < 0) {
        overlay.x = 0;
      } else if (overlay.x > xMax) {
        overlay.x = xMax;
      }

      if (overlay.y < 0) {
        overlay.y = 0;
      } else if (overlay.y > yMax) {
        overlay.y = yMax;
      }

      draw();
    } else if (drag.type === "resizeOverlay") {
      overlay.width = drag.originalOverlayWidth + (x - drag.originalX);

      // do not allow the overlay to get too small
      if (overlay.width < 10) {
        overlay.width = 10;
      }

      // Don't allow crop to overflow
      if (overlay.x + overlay.width > canvas.width) {
        overlay.width = canvas.width - overlay.x;
      }

      overlay.height = overlay.width * overlay.ratioXY;

      if (overlay.y + overlay.height > canvas.height) {
        overlay.height = canvas.height - overlay.y;
        overlay.width = overlay.height / overlay.ratioXY;
      }

      draw();
    }
  }

  function addEventListeners() {
    // add mouse listeners to the canvas
    canvas.onmousedown = function(event) {
      // depending on where the mouse has clicked, choose which type of event to fire
      var coords = canvas.getMouseCoords(event);
      initialCropOrMoveEvent(getClickPos(coords));
    };

    canvas.onmouseup = function() {
      // cancel any drags
      drag.inProgress = false;
    };

    canvas.onmouseout = function() {
      // cancel any drags
      drag.inProgress = false;
    };

    canvas.onmousemove = function(event) {
      var coords = canvas.getMouseCoords(event);

      startCropOrMoveEvent(getClickPos(coords));
    };

    canvas.addEventListener('touchstart', event => {
      initialCropOrMoveEvent(getTouchPos(event));
    });

    canvas.addEventListener('touchmove', event => {
      startCropOrMoveEvent(getTouchPos(event));
    });

    canvas.addEventListener('touchend', event => {
      drag.inProgress = false;
    });
  }


  /* CROPPING FUNCTIONS */
  function cropImage(entire) {
    // alert('1');
    // if we don't have an image file, abort at this point
    if (image === undef) {
      return false;
    }

    // if we aren't cropping, ensure entire is tru
    if (!cropping) {
      entire = true;
    }

    // assume we want to crop the entire image, this will be overriden below
    var x = 0;
    var y = 0;
    var width = image.width;
    var height = image.height;

    if (!entire) {
      // alert('2');
      // work out the actual dimensions that need cropping
      var factor = currentDimens.factor;

      x = Math.floor(overlay.x / factor);
      y = Math.floor(overlay.y / factor);
      width = Math.floor(overlay.width / factor);
      height = Math.floor(overlay.height / factor);

      // check the values are within range of the image
      if (x < 0) {
        x = 0;
      }
      if (x > image.width) {
        x = image.width;
      }
      if (y < 0) {
        y = 0;
      }
      if (y > image.height) {
        y = image.height;
      }

      if (x + width > image.width) {
        width = image.width - x;
      }
      if (y + height > image.height) {
        height = image.height - y;
      }
    }

    // load the image into the cropping canvas
    // alert('3');
    // alert(newWidth+'*'+newHeight);
    var cropCanvas = document.createElement("canvas");
    cropCanvas.setAttribute("width", newWidth); // changeImageSize
    cropCanvas.setAttribute("height", newHeight); // changeImageSize

    var cropContext = cropCanvas.getContext("2d");
    cropContext.drawImage(image, x, y, width, height, 0, 0, newWidth, newHeight);
    // cropContext.drawImage(image, x, y, width, height, 0, 0, 88, 88); // changeImageSize last two values
    // alert('4');
    return cropCanvas;
  }

  /* function borrowed from http://stackoverflow.com/a/7261048/425197 */
  function dataUrlToBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    return new Blob([ia], {
      type: mimeString
    });
  }

  /* API FUNCTIONS */
  cropper.showImage = function(src) {
    cropping = false;
    image = new Image();
    image.onload = function() {
      // alert(this.width + 'x' + this.height); // LO
      imagesize = 'width="' + this.width + '" height="' + this.height + '"';
      imagewidth = this.width;
      imageheight = this.height;
      // alert(imagesize);
      currentDimens = getScaledImageDimensions(image.width, image.height); // work out the scaling
      draw();
    };
    image.src = src;
  };

  // Added by Mick
  cropper.showResizedImage = function(src) {
    cropping = false;
    image = new Image();
    // image.onload = function() {
    // 	currentDimens = getScaledImageDimensions(image.width, image.height) ; // work out the scaling
    // 	draw();
    // };
    image.src = src;
    image.setAttribute("class", "image-mini");
    var sizepath = newWidth + 'x' + newHeight;
    image.setAttribute("data-sizepath", sizepath);
    var container = document.getElementById('minis');
    var div = document.createElement('div');
    div.className = "mini-container";
    var div2 = document.createElement('div');
    div2.className = "overlay";
    container.appendChild(div);
    div.appendChild(image);
    div.appendChild(div2);
    div2.innerHTML = "<span onclick='deleteMini(this)'>X</span>";
    cropper.restore();
  };
  // ends added by Mick

  cropper.startCropping = function() {
    // only continue if an image is loaded
    if (image === undef) {
      return false;
    }

    // save the current state
    restoreImage = new Image();
    restoreImage.src = image.src;

    cropping = true;
    draw();

    return true;
  };

  cropper.getCroppedImageSrc = function() {
    if (image) {
      // return the cropped image
      var cropCanvas = cropImage(!cropping); // cropping here controls if we get the entire image or not, desirable if the user is not cropping
      var url = cropCanvas.toDataURL("png");

      // show the new image, only bother doing this if it isn't already displayed, ie, we are cropping
      if (cropping) {
        cropper.showResizedImage(url);
      }

      cropping = false;
      return url;

    } else {
      return false;
    }
  };

  cropper.getCroppedImageBlob = function(type) {
    if (image) {
      // return the cropped image
      var cropCanvas = cropImage(!cropping); // cropping here controls if we get the entire image or not, desirable if the user is not cropping
      var url = cropCanvas.toDataURL(type || "png"); // Mick: .toDataURL('image/jpeg', 0.5)

      // show the new image, only bother doing this if it isn't already displayed, ie, we are cropping
      if (cropping) {
        cropper.showResizedImage(url);
      }

      cropping = false;

      // convert the url to a blob and return it
      return dataUrlToBlob(url);
    } else {
      return false;
    }
  };

  // Added by Mick
  cropper.setRatio = function(newSize) {
    newSize = newSize.split('x');
    newWidth = newSize[0];
    newHeight = newSize[1];
    // set up the overlay ratio
    var ratio = newHeight / newWidth;
    // alert("Changing ratio to: " +width+"*"+height);
    // alert("Changing ratio to: " + ratio);
    if (ratio) {
      setRatio(ratio);
      cropper.startCropping();
    }
  }; // ends added by Mick

  cropper.start = function(newCanvas, ratio) {
    // get the context from the given canvas
    canvas = newCanvas;
    if (!canvas.getContext) {
      return; // give up
    }
    context = canvas.getContext("2d");

    // Set default overlay position
    overlay = {
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      resizerSide: 10,
      ratioXY: 1
    };

    // set up the overlay ratio
    if (ratio) {
      setRatio(ratio);
    }

    // setup mouse stuff
    addEventListeners();
  };

  cropper.restore = function() {
    if (restoreImage === undef) {
      return false;
    }

    cropping = false;

    // show the saved image
    cropper.showImage(restoreImage.src);
    return true;
  };


  /* modify the canvas prototype to allow us to get x and y mouse coords from it */
  HTMLCanvasElement.prototype.getMouseCoords = function(event) {
    // loop through this element and all its parents to get the total offset
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do {
      totalOffsetX += currentElement.offsetLeft;
      totalOffsetY += currentElement.offsetTop;
    }
    while (currentElement == currentElement.offsetParent);

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {
      x: canvasX,
      y: canvasY
    };
  };

}(window.cropper = window.cropper || {}));








/// Starts upload
// https://supunkavinda.blog/php/image-upload-ajax-php-mysql
var fileOrBlob;
// var filepath;
var timer;



/* exported upload */
function upload() {
  var mImg = document.getElementById('mainImg');
  var file = mImg.files[0];
  if (file) {
    fileOrBlob = 'isFile';
    ajaxUpload(file);
  }

  // var files = document.getElementById("minis").childNodes;
  var files = document.querySelectorAll('.image-mini');
  if (files.length !== 0) {
    fileOrBlob = 'isBlob';
    files.forEach(ajaxUpload);
  }

  // function addToGallery(gallery) {
  //   return true;
  // }

  var txt = true;
  if (txt) {
    fileOrBlob = 'isTXT';
    file = true;
    ajaxUpload(file);
  }

}

function ajaxUpload(file) {
  // console.log('fileOrBlob: ' + fileOrBlob);
  //	var file = imageSelecter; //.files[0];
  // var fileOrBlob = this.valueOf();

  if (!file) {
    return alert("Please select a file");
  }

  var formData = new FormData();
  // var d = new Date();
  // var filename = d.getTime();
  var filename = document.getElementById("filename").value;
  var mImg = document.getElementById('mainImg');
  var originfilename = mImg.files[0].name;
  var ext = originfilename.split(/[. ]+/).pop();



  if (fileOrBlob == 'isFile') {
    file = mImg.files[0];
    formData.append('file', file);
    formData.append('image', null);
    formData.append('fileOrBlob', 'isFile');
    formData.append('filename', filename);
    formData.append('ext', ext);
  }

  if (fileOrBlob == 'isBlob') {
    var sizepath = file.dataset.sizepath;
    file = file.src;
    formData.append('image', file);
    formData.append('fileOrBlob', 'isBlob');
    formData.append('filename', filename);
    formData.append('sizepath', sizepath);
    formData.append('ext', ext);
  }
  if (fileOrBlob == 'isTXT') {

    formData.append('fileOrBlob', 'isTXT');
    var author = document.getElementById('author').value;
    formData.append('author', author);
    filename = document.getElementById('filename').value;
    formData.append('filename', filename);
    formData.append('originfilename', originfilename);
    formData.append('imagesize', imagesize);
    formData.append('ext', ext);
    var title = document.getElementById('title').value;
    formData.append('title', title);
    var commentary = document.getElementById('commentary').value;
    formData.append('commentary', commentary);
  }
  if (fileOrBlob == 'isGallery') {
    formData.append('fileOrBlob', 'isGallery');
    var gallery = document.getElementById('gallery').value;
    formData.append('gallery', gallery);
  }

  // do the ajax part
  var ajax = new XMLHttpRequest();

  ajax.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      console.log("My err:");
      console.log(this.responseText);
      var json = JSON.parse(this.responseText);
      if (!json || json.status !== true) {
        alert(json.error);
      } else {
        if (json.id) {
          preOverlay(json);
        }
      }
    }
  };



  var progress = document.getElementById("progress");
  ajax.upload.onprogress = function(event) {
    progress.max = event.total;
    progress.value = event.loaded;
  };

  ajax.open("POST", "imgup.php", true);
  ajax.send(formData); // send the form data

}

function preOverlay(json) {
  // alert(json.filepath);
  displayBlock('overlay');
  displayBlock('loading');

  checkUploaded(json);
  timer = setInterval(function() {
    checkUploaded(json);
  }, 3000);

  setTimeout(function() {
    stopCheckUpload(timer, json.url);
  }, 16000);

}

function stopCheckUpload(timer, url) {
  clearInterval(timer);
  document.getElementById('loading').innerHTML = "<span style='color:rgb(255, 93, 93)'>imgup</span><span style='color:rgb(255, 237, 158)'>@</span><span style='color:rgb(0, 255, 227)'>system</span> <span style='color:rgb(248, 255, 119)'>~</span> <span style='color:rgb(227, 0, 255)'>#</span> Argh!!! Could not load the image '" + url + "' on time.";

}

function setInOverlayContent(json) {
  document.getElementById('id').value = json.id;
  document.getElementById('uid').innerHTML = json.id;
  document.getElementById('inuurl').value = json.url;
  document.getElementById('utitle').innerHTML = json.title;
  document.getElementById('ucommentary').innerHTML = json.commentary;
  document.getElementById('ugallery').innerHTML = json.gallery;
  document.getElementById('uimage').src = "http://" + json.url;
  // var newImageSize =
  uimageRatioFit(imagewidth, imageheight);
  // alert(newImageSize.width);
  console.log('preOverlay');
  document.getElementById("editbtn").onclick = function () { edit(json.id); };
  document.getElementById('upload').value = "UPDATE";
}

function checkUploaded(json) {

  document.getElementById('loading').style.display = "block";
  // console.log("inCheckUploaded");
  var http = new XMLHttpRequest();
  http.open('HEAD', json.filepath, false);
  http.send();
  console.log("Image status: " + http.status);
  if (http.status == 200) {
    console.log("Status 200 if: " + http.status);
    clearInterval(timer);
    displayNone('loading');
    displayBlock('inoverlay');
    setInOverlayContent(json);
  }
}

// function checkUploadedTimer() {
//   // if (checkUploaded(json.filepath) !== 200) {
//   //   return true;
//   // } else {
//   //   return false;
//   // }
//   var d = new Date();
//   var s = d.getSeconds();
//   console.log("Waiting for server image -> s: " + s);
// }

/**
 * Conserve aspect ratio of the original region. Useful when shrinking/enlarging
 * images to fit into a certain area.
 *
 * @param {Number} srcWidth width of source image
 * @param {Number} srcHeight height of source image
 * @param {Number} avalWidth maximum available width
 * @param {Number} avalHeight maximum available height
 * @return {Object} { width, height }
 */
function uimageRatioFit(srcWidth, srcHeight) {
  var avalSize = getAvalSpace(0, 30);
  var avalWidth = avalSize.width;
  var avalHeight = avalSize.height;
  // var orientation;
  var ratio = Math.min(avalWidth / srcWidth, avalHeight / srcHeight);
  var newWidth = srcWidth * ratio;
  var newHeight = srcHeight * ratio;

  console.log('newWidth: ' + newWidth);
  console.log('avalWidth: ' + avalWidth);
  var percent = Math.floor(newWidth * 100 / avalWidth);
  if (newWidth >= srcWidth) {
    percent = Math.floor(srcWidth * 100 / avalWidth);
  }
  console.log('percent: ' + percent);

  if (newWidth >= srcWidth || newHeight >= srcHeight) {

    newWidth = srcWidth;
    newHeight = srcHeight;
  }
  // return { width: srcWidth*ratio, height: srcHeight*ratio };
  document.getElementById('uimage').width = newWidth;
  document.getElementById('uimage').height = newHeight;
  if (newWidth <= newHeight && percent < 60) {
    // orientation = 'vertical';
document.getElementById('imgTXT').setAttribute("style", "width:calc(100% - " + Math.floor(newWidth + 36) + "px); float: left;");
document.getElementById('imgContainer').className = "vertical";
  } else {
    // orientation = 'horizontal';
    document.getElementById('imgTXT').setAttribute("style", "clear: both;");
    document.getElementById('imgContainer').className = "horizontal";
  }

  document.getElementById("overlay").style.height = document.documentElement.scrollHeight+"px";
  console.log('DocumentSize: '+ document.documentElement.scrollHeight);

}

// Defining event listener function
function getAvalSpace(offsetw, offseth) {
  // Get width and height of the window excluding scrollbars
  var w = document.documentElement.clientWidth - offsetw;
  var h = document.documentElement.clientHeight - offseth;
  // Display result inside a div element
  console.log("Width: " + w + ", " + "Height: " + h);
  return {
    width: w,
    height: h
  };
}

function edit(id){
  // alert(id);
  displayNone('inoverlay');
  displayNone('overlay');
  document.getElementById('id').value = id;
  // alert(window.location.href)
}

function displayBlock(id) {
  document.getElementById(id).style.display = "block";
}
function displayNone(id) {
	document.getElementById(id).style.display = "none";
}


/* exported changeImgConfirm */
function changeImgConfirm(){
  var minis = document.querySelectorAll('.image-mini');
        console.log('minis: '+minis.length);
  if (minis.length > 0){
  if(confirm("Changing image will remove your created miniatures")){
    while (document.getElementsByClassName('mini-container')[0]) {
    document.getElementsByClassName('mini-container')[0].remove();
  }
    console.log('minis confirm: '+minis.length);

  }else{
    console.log('minis !confirm: '+minis.length);
    return false;
}
  }
}

function setFilename(param = 'default') {
  var filename;
  var fnField = document.getElementById("filename");
  var author = document.getElementById("author").value;
if(param == 'default'){
var time = getTime();
console.log(time);
filename = time+"_by-"+author;
filename = filename.replace(/ /g, "-");
// // console.log("2: " + filename);
fnField.value = filename;
    }
  if(param=='title'){
  filename = document.getElementById("title").value + "_by-" + document.getElementById("author").value;
  // console.log("1: " + filename);
  filename = filename.replace(/ /g, "-");
  // console.log("2: " + filename);
  fnField.value = filename;
}
}

/* exported clearField */
function clearField(field) {
  if (field.value == "Title" || field.value == "Artist's commentary here.") {
    field.value = "";
  }
}

/* exported deleteMini */
function deleteMini(mini) {
  mini.parentElement.parentElement.remove();
}

/* exported copyToClipboard */
function copyToClipboard(id){
var field = document.getElementById(id);
field.select();
document.execCommand("Copy");
alert("Copied image URL to clipboard");
}

function getTime() {
    var now     = new Date();
    var year    = now.getFullYear();
    var month   = now.getMonth()+1;
    var day     = now.getDate();
    var hour    = now.getHours();
    var minute  = now.getMinutes();
    var second  = now.getSeconds();
    if(month.toString().length == 1) {
         month = '0'+month;
    }
    if(day.toString().length == 1) {
         day = '0'+day;
    }
    if(hour.toString().length == 1) {
         hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
         minute = '0'+minute;
    }
    if(second.toString().length == 1) {
         second = '0'+second;
    }
    var dateTime = year+''+month+''+day+''+hour+''+minute+''+second;
     return dateTime;
}

window.addEventListener('load', () => {
  console.log('imgUp is fully loaded');
  setFilename();
});

// Attaching the event listener function to window's resize event
// window.addEventListener("resize", displayWindowSize);
window.addEventListener("resize", function() {
  uimageRatioFit(imagewidth, imageheight);
}, false);
