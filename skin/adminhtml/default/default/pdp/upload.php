<?php
if($_SERVER['REQUEST_METHOD'] == "POST"){
	//------Int Mage--------------
	$appPath = $_POST['base_dir'] . '/app/Mage.php';
	require_once($appPath);
	umask(0);
	Mage::app();
	//------End Int Mage--------------
	$mediaPath = Mage::getBaseDir('media') . '/pdp/images/artworks/';
    $fontPath = Mage::getBaseDir('media') . '/pdp/fonts/';
    $data = $_REQUEST;
    $allowImages = array("image/jpg", "image/png", "image/bmp", "image/jpeg", "image/gif", 'image/svg+xml');
	$allowFonts = array("ttf", "otf", "fnt", "fon", "woff", "dfont");
    
	if (!is_dir($mediaPath)) {
		mkdir($mediaPath, 0755, true);
	}
    if (!is_dir($fontPath)) {
		mkdir($fontPath, 0755, true);
	}
    
    //Font or image
    $uploadPath = $mediaPath;
	
	$filename = $_FILES['file']['name'];
	$ext = substr($filename, strrpos($filename, '.') + 1);
	//Unique file name for custom image
	$filename = "Custom-Image-" . time() . '.' . $ext;
    if (!in_array($data['file_type'], $allowImages)) {
		$uploadPath = $fontPath;
		$filename = str_replace(" ", "_", strtolower($_FILES['file']['name']));
		$data['filename'] = $filename;
	}
	if(move_uploaded_file($_FILES['file']['tmp_name'], $uploadPath . $filename)){
		//Insert data to db
		
		$pdp = Mage::getModel('pdp/pdp');
        $baseUrl = Mage::getBaseUrl(Mage_Core_Model_Store::URL_TYPE_LINK);

		if (in_array($data['file_type'], $allowImages)) {
            $image_type = $data['upload_file_type'];
            $data['image_type'] = $image_type;
			$data['filename'] = $filename;
			$dataInfo = $pdp->setDesignImage($data);
        } else {
			$filename = explode('.', $data['filename']);
			$name = $filename[0];
			$ext = $filename[1];
			if (in_array(strtolower($ext), $allowFonts)) {
				$data['name'] = str_replace(" ", "_", strtolower($name));
				$data['ext'] = $ext;
				$dataInfo = $pdp->setDesignFont($data);
			}
		}
		//To remove an element after done updating
		if ($dataInfo != "") {
            $mediaImageLink = Mage::getBaseUrl(Mage_Core_Model_Store::URL_TYPE_MEDIA) . 'pdp/images/';
            $dataInfo['index'] = $_POST['index'];
            $dataInfo['preview_path'] = $mediaImageLink . $dataInfo['filename'];
			echo json_encode($dataInfo);
		}
	}
	exit;
}
?>