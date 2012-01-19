<?php

$img_src = $_POST["image_url"];
$imgbinary = file_get_contents($img_src);
$img_str = base64_encode($imgbinary);
//echo '<img src="data:image/jpg;base64,'.$img_str.'" />';
echo $img_str;
?>