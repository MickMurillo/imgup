<?php
// https://supunkavinda.blog/php/image-upload-ajax-php-mysql
// echo $_SERVER['DOCUMENT_ROOT'];
// exit();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
include_once("D:\www\conf\imgup.php");

try {
    // echo "Here starts: ";
    // var_dump($_POST);
    // var_dump($_FILES);
    // exit;
    $filename = $_POST['filename'];
    if ($filename=="filename") {
        $filename = date("YmdHms");
        $filename = (string)$filename;
    }
    $settings = file_get_contents("settings.json");
    $settings = json_decode($settings, true);
    $imgpath = $settings['imgpath'];
    $relimgpath = $settings['relimgpath'];
    $ext = $_POST['ext'];
    if ($ext=="jpeg") {
        $ext="jpg";
    }
    $url = $_SERVER['HTTP_HOST'].$imgpath.$filename.".".$ext;



    if ($_POST['fileOrBlob']=='isFile') {
        // Check file type and set file extension
        $allowedTypes = array( 'image/jpeg', 'image/gif', 'image/png' );
        $fileInfo = finfo_open(FILEINFO_MIME_TYPE);
        $detectedType = finfo_file($fileInfo, $_FILES['file']['tmp_name']);
        if (!in_array($detectedType, $allowedTypes)) {
            throw new \Exception("File is not an allowed image", 1);
        }
        $typeArr = explode("/", $detectedType);
        $ext = ".".$typeArr[1];
        if ($ext==".jpeg") {
            $ext=".jpg";
        }
        finfo_close($fileInfo);
        // echo "type: ".$detectedType;
        // echo "extension: ".$ext;
        // ends
        $imgfolderpath = $_SERVER['DOCUMENT_ROOT'].$imgpath;
        $fullpath = $_SERVER['DOCUMENT_ROOT'].$imgpath.$filename.$ext;
        if (!file_exists($imgfolderpath)) {
            if (!mkdir($imgfolderpath, 755, true)) {
                throw new \Exception("Failed to create folder: ".$minisfolderpath, 1);
            }
        }
        if (!move_uploaded_file($_FILES['file']['tmp_name'], $fullpath)) {
            $err = error_get_last();
            $errString = $err['message']."- line: ".$err['line'];
            throw new Exception('error in moving file: move_uploaded_file '.$errString);
        } else {
            exit(
                  json_encode(
                      array(
                          'status' => true,
                          'url' => $url,
                          'fileOrBlob' => 'isFile'
                      )
                  )
              );
        }
    }




    if ($_POST['fileOrBlob']=='isBlob') {
        $data = $_POST['image'];
        $minisPath = "minis/";
        $sizePath = $_POST['sizepath'];
        $minisfolderpath =$_SERVER['DOCUMENT_ROOT'].$imgpath.$minisPath.$sizePath."/";
        $fullpath = $_SERVER['DOCUMENT_ROOT'].$imgpath.$minisPath.$sizePath."/".$filename.$ext;

        if (!file_exists($minisfolderpath)) {
            if (!mkdir($minisfolderpath, 755, true)) {
                throw new \Exception("Failed to create folder: ".$minisfolderpath, 1);
            }
        }
        if (preg_match('/^data:image\/(\w+);base64,/', $data, $type)) {
            $data = substr($data, strpos($data, ',') + 1);
            $type = strtolower($type[1]); // jpg, png, gif
            if ($type=="jpeg") {
                $type="jpg";
            }

            if (!in_array($type, [ 'jpg', 'jpeg', 'gif', 'png' ])) {
                throw new \Exception('invalid image type');
            }
            $data = base64_decode($data);
            if ($data === false) {
                throw new \Exception('base64_decode failed');
            }
        } else {
            throw new \Exception('did not match data URI with image data');
        }
        if (!file_put_contents($fullpath, $data)) {
            throw new \Exception('error in saving file, file_put_contents.');
        } else {
            exit(
      json_encode(
          array(
              'status' => true,
              'url' => null,
              'fileOrBlob' => 'isBlob'
          )
      )
    );
        }
        // --
    // exit();
    }


    if ($_POST['fileOrBlob']=='isTXT') {
        $filename = $filename.".".$_POST['ext'];
        // $imgpath = "../../img/".$filename;
        // $imagearr = getimagesize($imgpath);
       $imagesize = $_POST['imagesize'];//$imagearr[3];
        // var_dump($imagesize);
        // echo("image size: ".$imagesize);
        // echo "inIsTXT";
        // throw new \Exception('url: '.$url);
        $stmt = $mysqli -> prepare('INSERT INTO images (author, filename, originfilename, url, imagesize, title, commentary) VALUES (?,?,?,?,?,?,?)');
        if (
        $stmt &&
        $stmt -> bind_param('sssssss', $_POST['author'], $filename, $_POST['originfilename'], $url, $imagesize, $_POST['title'], $_POST['commentary']) &&
        $stmt -> execute()
    ) {
            $id = $stmt->insert_id;
            $filepath = $relimgpath.$filename;
            exit(
            json_encode(
                array(
                    'status' => true,
                    'id' => $id,
                    'author' =>  $_POST['author'],
                    'filename' => $filename,
                    'originfilename' => $_POST['originfilename'],
                    'url' => $url,
                    'imagesize' => $imagesize,
                    'title' => $_POST['title'],
                    'commentary' => $_POST['commentary'],
                    'gallery' => 'default',
                    'filepath' => $filepath,
                    'fileOrBlob' => 'isTXT'
                )
            )
        );
        } else {
            throw new \Exception('Error in saving into the database');
        }
    }
} catch (Exception $e) {
    exit(json_encode(
        array(
            'status' => false,
            'error' => $e -> getMessage()
        )
    ));
}
