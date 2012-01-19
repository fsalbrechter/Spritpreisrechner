<?php
	$response = "";
		
	define (URL, "url");
	define (PURL, "purl");
	
	if ($_GET[URL])
	{
		// encodes the images to base64 to be storable in the webstorage
		$ch = curl_init(urldecode($_GET[URL]));	
		
		curl_setopt($ch, CURLOPT_HEADER, FALSE);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER , TRUE);		
			
		$response = curl_exec($ch);
			
		curl_close($ch);
		
		header("Pragma: public");
		header("Cache-Control: public");
		
		// delete browser cache
		header('Expires: ' . gmdate("D, d M Y H:i:s", (time()-60000)) . " GMT");
		header("Content-Length: " . strlen($response));
		
		echo $response;
	} else if ($_POST[PURL]) {
	  
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "http://www.caffeinated.at/MMIS/imgb64.php");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, true);


    $data = array(
        'image_url' => $_POST[PURL],
    );

    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    $output = curl_exec($ch);
    $info = curl_getinfo($ch);
    curl_close($ch);
	  echo $output;
	}
		
?>