<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
include_once("D:\www\conf\imgup.php");

$query = "SELECT * FROM images WHERE 1;";
$result = mysqli_query($mysqli, $query) or die(mysqli_error($db));

if($result!=NULL){ while($row = mysqli_fetch_array($result)) {
  echo $row['title']." by ". $row['author'] . ", filename: " . $row['filename'] . " with ID: " .$row['id'] . "<br />";
}
}
?>
