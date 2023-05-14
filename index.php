<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$_GET['id']=1;
if(isset($_GET['id'])){
$editmode ="true";
$id = $_GET['id'];
$imgfile = "";
$title = "title";
$description = "Description";
$author = "Anonymous";

}

include_once("../../../../Shadow/mublisher/imgup.php");

 ?><!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<title>imgUp</title>
	<!-- Import the library js file -->
	<!-- You might want to use "imgup-min.js" on an actual site -->
	<script src="imgup.js"></script>
<link rel="stylesheet" type="text/css" href="style.css" />
</head>

<body>
	<div id="overlay">
		<div class="actions"><input type="button" value="ADD ANOTHER IMAGE" onclick="location.reload();"><input id="editbtn" type="button" value="EDIT"></div>
<div id="loading">Loading...</div>
		<div id="inoverlay">

	<div id="imgContainer">
			<img id="uimage" src="http://mickmurillo.com/graph/spacer.gif" alt="uploaded image" />
		</div>
	<div id="imgTXT">
		<h1>Congratulations!</h1>
		<h2>Your image was uploaded.</h2>
		<div><div>ID: </div><div id="uid">{ID}</div></div>
		<div><div>URL:</div><div id="uurl"><input type="text" id="inuurl" value="" readonly /><input type="button" onclick="copyToClipboard('inuurl')" value="COPY" /></div></div>
		<div><div>title:</div><div id="utitle">{title here}</div></div>
		<div><div>commentary:</div><div id="ucommentary">{commentary here}</div></div>
		<div><div>gallery:</div><div id="ugallery">{gallery here}</div></div>
	</div>

	</div>
	<!--div class="clear"></div-->
</div>



	<!--div id="preheader"></div-->
	<!-- Below are a series of inputs which allow file selection and interaction with the cropper api -->
	<nav class="actions">
		<a href="../">TOOLS</a>
		<!--input type="file" id="mainImg" onchange="handleFileSelect(this)" accept="image/*" /-->
		<label class="file">
      <!-- onclick="changeImgConfirm()" onchange="handleFileSelect(this)" -->
			<input type="file" id="mainImg" aria-label="File browser" accept="image/*">
			<span><span id="custFileMSG">Choose your file &nbsp;</span><span><img src="http://mickmurillo.com/graph/upload-icon.gif" width="30" height="30" alt="upload icon"></span></span>
		</label><select id="size" name="size" onchange="cropper.setRatio(this.value)">
			<option value="88x88">88x88</option>
			<option value="44x88">44x88</option>
			<option value="120x120">120x120</option>
			<option value="360x240">360x240</option>
		</select><input type="button" onclick="cropper.startCropping()" value="Start cropping" /><input type="button" onclick="cropper.getCroppedImageBlob()" value="Crop" /><input type="button" onclick="cropper.restore()" value="Restore" /><input type="button" id="upload" onclick="upload()" value="UPLOAD" /><progress id="progress" value="0"></progress><input type="button" onclick="delete()" value="DELETE" class="delete" />
	</nav>

	<div id="workarea">
		<!-- A canvas which cropper will draw on -->
	<div id="mainImgCanWrapper">
			<canvas id="mainImgCanvas" width="700" height="700">Your browser does not support canvas.</canvas>
		</div>
		<div id="minis"></div>
	</div>

	<div id="txtfields">
		<input type="text" id="title" onfocus="clearField(this)" onkeyup="setFilename('title')" value="Title" />
		<textarea rows="6" onfocus="clearField(this)" id="commentary">Artist's commentary here.</textarea><br />
		<select id="gallery" name="size" onchange="addToGallery(this.value)">
			<option value="default">Choose Gallery</option>
			<option value="cyborgs">Cyborgs</option>
			<option value="swords">Swords</option>
			<option value="wampiria">Wampiria</option>
			<option value="new">New Gallery</option>
		</select>
		<input type="text" id="author" value="<?php echo $author; ?>" readonly />
		<input type="text" id="filename" value="filename" readonly />
    <input type="hidden" id="id" value="ID" />
	</div>
	<footer>imgUp Alpha pre v.1 | &copy; 2020 <a href="https://www.mickmurillo.com">Mick Murillo</a> | <a href="license.txt">License</a> | <a href="credits.txt">Credits</a> |  Hosted in <?php echo gethostname(); ?></footer>

	<script>
  /* global cropper */
  cropper.start(document.getElementById("mainImgCanvas"), 1); // initialize cropper by providing it with a target canvas and a XY ratio (height = width * ratio)

  function handleFileSelect() {
    var file = document.getElementById("mainImg").files[0];
    // this function will be called when the file input below is changed
    // get a reference to the selected file
    var reader = new FileReader(); // create a file reader
    // set an onload function to show the image in cropper once it has been loaded
    reader.onload = function(event) {
      var data = event.target.result; // the "data url" of the image
      cropper.showImage(data); // hand this to cropper, it will be displayed
    };

    reader.readAsDataURL(file); // this loads the file as a data url calling the function above once done

    document.getElementById("custFileMSG").innerHTML = file.name;
  }

/* global changeImgConfirm */
  var mainImg = document.getElementById('mainImg');
  mainImg.addEventListener("click", changeImgConfirm, false);
  mainImg.addEventListener("change", handleFileSelect, false);

// cropper.showImage("http://localhost/gDev/mublisher/imgup/img/Rose_by-Mick-Murillo.jpg");
	</script>
</body>
</html>
