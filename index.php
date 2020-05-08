<?php
// if(isset($_GET['id'])){
// $editmode ="true";
// $id = $_GET['id'];
// $imgfile = "";
// $title = "Edit title";
// $description = "Edit Description";
// $author = "Edit Author";
//
// }

$settings = file_get_contents("settings.json");
$settings = json_decode($settings, true);
$path = $settings['imgpath'];
$author = $settings['author'];

 ?><!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<title>imgUp</title>
	<!-- Import the library js file -->
	<!-- You might want to use "cropper_jsmin.js" on an actual site -->
	<script src="imgup.js"></script>
	<style>
		* {
			margin: 0;
			padding: 0;
			font-family: sans-serif;
		}
    html {
      width: 100%;
      height: 100%;
    }
		body {
      width: 100%;
      height: 100%;
			background-color: grey;
			background-image: url(../../graph/mini-blue-band-bg.gif);
		}
		.actions {
			padding: 0 0 0 14px;
			background-color: black;
			color: white;
			height: 30px;
			clear: both;
		}
		.actions a{
			line-height: 26px;
			padding: 0 5px 0 5px;
			display:inline-block;
			border: 2px solid blue;
			text-align: center;
			color: yellow;
			text-decoration: none;
			vertical-align: top;
		}

		.actions input,
		.actions select,
		.actions progress {
			padding: 4px;
			height: 30px;
			vertical-align: top;
			border: 0;
			background-color: #ff6b1c;how to use eslint
			color: white;
			font-weight: bold;
			cursor: pointer;
			border-left: 1px solid black;
		}
		.actions progress{
			padding: 0;
		}
		input#upload{
			background-color: #03dbfc;
		}
		input.delete{
			background-color: red !important;
		}

		#workarea {
			background-color: gray;
			width: 100%;
			min-width: 960px;
			height: 702px;
		}

		#mainImgCanWrapper {
			width: 700px;
			height: 700px;
			border: 1px solid black;
			background-color: white;
			float: left;
		}

		#mainImgCanvas {
			background-color: white;
		}

		div#minis {
			border: 1px solid black;
			width: calc(100% - 714px);
			height: 700px;
			float: left;
			overflow: scroll;
			background-color: white;
		}

		#minis .mini-container {
			position: relative;
			display: inline-block;
			margin: 6px;
		}

		#minis .mini-container .overlay {
			top: 0;
			left: 0;
			bottom: 0;
			right: 0;
			position: absolute;
			z-index: 2;


		}

		#minis .mini-container .overlay span {
			font-size: 10px;
			line-height: 12px;
			font-weight: bold;
			background-color: red;
			color: white;
			cursor: pointer;
			width: 12px;
			height: 12px;
			display: block;
			float: right;
			text-align: center;
		}


		.image-mini {
			border: 1px solid grey;
		}

		textarea {
			width: 640px;
			height: 60px;
			padding: 8px;
			border: 2px solid black;
		}

		input#title {
			width: 640px;
			padding: 8px;
			border: 2px solid black;
		}

		div#txtfields {
			margin: 12px;
		}

		select#gallery {
			width: 200px;
			padding: 8px;
			border: 2px solid black;
		}

		#author,
		#filename {
			padding: 8px;
			border: 2px solid black;
			height: 17px;
		}

		.file input[type=file] {
			display: none;
		}

	.file, .file>span {
			height: 30px;
			width: 320px;
			background-color: gray;
			display: inline-block;
			cursor: pointer;
		}
		.file>span>span{
			height: 30px;
			line-height: 30px;
			display: block;
			float: left;

		}
		.file>span>span:first-of-type {
			width: 280px;
			text-align: right;
			white-space: nowrap;
			overflow: hidden;
			padding: 0 5px 0 5px;
		}
		footer{
			font-size: 10px;
			padding-left: 20px;
		}
		footer a {
			color: black;
		}
		#overlay{
			background-color:rgba(0,0,0,0.7);
			position: absolute;
			z-index: 100;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			color: white;
			display: none;
			width: 100%;
			min-height: calc(100vh - 30px);
			height: auto;
		}
		#inoverlay{
			display: none;
			min-height: calc(100vh - 30px);
		}
		#overlay h2{
			color: #d0ff00;
			padding: 0 0 20px 0;
		}
		#overlay h2 {
		padding: 20px;
	  margin-bottom: 10px;
		}
		#overlay p{
		padding: 10px 20px;
		color: gray;
		}
		#overlay p span{
			color: white;
		}
		#overlay .actions input{
			display: inline-block;
			float: right;
		}
#loading {
	padding:80px;
	font-size: 24px;
	display: none;
}
#imgContainer{
	float: left;
}
.horizontal{
	background-color:rgba(0, 0, 0, 0.5);
	border-bottom: 1px solid black;
	width: 100%;
	clear: both;
	text-align: center;
}
.vertical{
	background-color:rgba(0, 0, 0, 0.5);
	height: calc(100vh - 30px);
}
#imgTXT{
	/* float: left; */
	padding: 16px;
}
#imgTXT > div {
	width: 100%;
	min-height: 30px;
	height: auto;
	clear: both;
	/* padding: 6px 0 6px 0; */
	border-bottom: 1px solid black;
}
#imgTXT > div > div {
	line-height: 30px;
	min-height:30px;
	width: auto;
	height: auto;
	float: left;
	overflow:hidden;

}
#imgTXT > div > div:first-of-type{
	color: rgb(173, 255, 0);
	width: 120px;
	text-align: right;
	padding-right: 12px;
}
#imgTXT > div > div:last-of-type{
	width: calc(100% - 136px);
}
#uimage {
	display: block;
	margin: auto;
}
#imgTXT #uurl, #imgTXT #utitle {
	height: 30px;
	overflow: hidden;
}
#inuurl, #uurl input[type='button']{
background-color: rgb(255, 255, 255, 0);
color: white;
border: 0;
height: 30px;
}
#uurl input[type='button']{
padding: 0 12px 0 12px;
border-left: 2px solid black;
font-weight: bold;
}
#imgTXT #ucommentary{
	width: calc(100% - 158px);
	padding: 3px 12px 0 10px;
	line-height: 24px;
	max-height: 300px;
	overflow: auto;
	height: auto;
	border-right: 4px solid orange;
	border-bottom: 1px solid black;
	background-color: rgb(80, 80, 80);
}
.clear{
	clear: both;
	width: 0;
	height: 0;
}
	</style>

</head>

<body>
	<div id="overlay">
		<div class="actions"><input type="button" value="ADD ANOTHER IMAGE" onclick="location.reload();"><input id="editbtn" type="button" value="EDIT"></div>
<div id="loading">Loading...</div>
		<div id="inoverlay">

	<div id="imgContainer">
			<img id="uimage" src="../../graph/spacer.gif" alt="uploaded image" />
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
			<input type="file" id="mainImg" aria-label="File browser" onclick="changeImgConfirm()" onchange="handleFileSelect(this)" accept="image/*">
			<span><span id="custFileMSG">Choose your file &nbsp;</span><span><img src="../../graph/upload-icon.gif" width="30" height="30" alt="upload icon"></span></span>
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
    <input type="hidden" id="id" value="ID" readonly />
	</div>
	<footer>imgUp Alpha pre v.1 | &copy; 2020 <a href="https://www.mickmurillo.com">Mick Murillo</a> | <a href="license.txt">License</a> | <a href="credits.txt">Credits</a> |  Hosted in <?php echo gethostname(); ?></footer>

	<script>

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
	</script>
</body>
</html>
