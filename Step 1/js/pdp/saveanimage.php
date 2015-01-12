<?php
$appPath = $_POST['base_dir'] . '/app/Mage.php';
require_once($appPath);
umask(0);
Mage::app();
//------End Int Mage--------------
$mediaPath = Mage::getBaseDir('media') . '/pdp/sides/';
if(!file_exists($mediaPath)) {
	//echo "Folder sides not exists";
	//Create sides folder
	mkdir($mediaPath, 0777, true);
}
if(file_exists($mediaPath)) {
	$imagePath = Mage::getBaseUrl(Mage_Core_Model_Store::URL_TYPE_MEDIA) . 'pdp/sides/';
	$data = $_POST['data'];
	//$file = 'media/chung.png';
	// remove "data:image/png;base64,"
	//Zend_Debug::dump($datas);
	//return;
	$index = $_POST['index'];;
	$filename = "design_image_" . time(). $index . '.png';
	$file = $mediaPath . $filename;
	if(substr($data,0,4)=='data'){
		$uri =  substr($data,strpos($data,",")+1);
		// save to file
		file_put_contents($file, base64_decode($uri));
	}else{
		// save to file
		file_put_contents($file, file_get_contents($data));
	};
	$out = array('path'=>$imagePath . $filename,'index'=>$index);

	echo json_encode($out);
}
