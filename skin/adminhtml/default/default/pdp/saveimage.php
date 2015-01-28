<?php
$appPath = $_POST['base_dir'] . '/app/Mage.php';
require_once($appPath);
umask(0);
Mage::app();
//------End Int Mage--------------
$mediaPath = Mage::getBaseDir('media') . '/pdp/design/';
$imagePath = Mage::getBaseUrl(Mage_Core_Model_Store::URL_TYPE_MEDIA) . 'pdp/design/';

$data = $_POST['data'];
$filename = md5(uniqid()) . '.png';
$file = $mediaPath . $filename;
//$file = 'media/chung.png';
// remove "data:image/png;base64,"
$uri =  substr($data,strpos($data,",")+1);

// save to file
file_put_contents($file, base64_decode($uri));

// return the filename
echo $imagePath . $filename;