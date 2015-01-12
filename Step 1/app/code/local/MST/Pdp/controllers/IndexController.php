<?php
class MST_Pdp_IndexController extends Mage_Core_Controller_Front_Action
{
    public function indexAction()
    {
        $this->loadLayout();
        $this->renderLayout();
    }
	public function testAction()
    {
		echo "Test<pre>";
        $cart = Mage::getModel('checkout/cart')->getQuote();
        foreach ($cart->getAllItems() as $item) {
            Zend_Debug::dump($item->getBuyRequest()->getData());

        }

	}
	public function deleteImageAction()
	{
		$filename = $_POST['filename'];
		if ($filename != "") {
			Mage::getModel('pdp/pdp')->deleteImageByFilename($filename);
		}
	}
	public function deleteImageByIdAction()
	{
		$img_list = $_POST['img_list'];
		if ($img_list != "") {
			$imgArr = explode(',', $img_list);
			foreach ($imgArr as $img) {
				$temp = explode('_', $img);
				$id = $temp[1];
				Mage::getModel('pdp/pdp')->deleteImageById($id);
			}
		}
	}
	public function deleteFontByIdAction()
	{
		$font_list = $_POST['font_list'];
		if ($font_list != "") {
			$fontArr = explode(',', $font_list);
			foreach ($fontArr as $font) {
				$temp = explode('_', $font);
				$id = $temp[1];
				Mage::getModel('pdp/pdp')->deleteFontById($id);
			}
		}
	}
	public function getImageInfoAction()
	{
		$imageId = $_POST['image_id'];
		if ($imageId != "") {
			$info = Mage::getModel('pdp/pdp')->getImageInfo($imageId);
			$this->getResponse()->setBody($info);
		}
	}
	public function updateImageInfoAction()
	{
		$data = $this->getRequest()->getParams();
		Mage::getModel('pdp/pdp')->updateImageInfo($data);
	}
	public function editColorAction()
	{
		$image_id = $_POST['image_id'];
		if ($image_id != "") {
			$model = Mage::getModel('pdp/images')->load($image_id);
			$options = $model->getColor();
			$this->getResponse()->setBody($options);
		}
	}
	public function deleteColorAction()
	{
		$imgColorId = $_POST['imagecolor_id'];
		if ($imgColorId != "") {
			echo Mage::getModel('pdp/pdp')->deleteColorImage($imgColorId);
		}
	}
	public function deleteDesignColorAction()
	{
		$designId = $_POST['design_id'];
		if ($designId != "") {
			echo Mage::getModel('pdp/pdp')->deleteDesignColor($designId);
		}
	}
	
	public function getImagePagingAction(){
		$page_size = $_POST['page_size'];
		$current_page = $_POST['current_page'];
		$url = $_POST['url'];
		$category = $_POST['category'];
		$collection = Mage::getModel('pdp/pdp')->getImageCollectionByCategory($category);
		$collection_counter = Mage::getModel('pdp/pdp')->getImageCollectionByCategory($category);
		$total = count($collection_counter);
		$viewPerPage = Mage::helper('pdp')->getViewPerPage();
		
		$data = Mage::helper('pdp')->pagingCollection($current_page, $page_size, $viewPerPage, $collection, $total, $url, $category);
		
		$new_data=array();
		$new_data['paging_text'] = $data['paging_text'];
		foreach ($data['collection'] as $item){
			$new_data['collection'][] = array($item->getData());
		}
		$this->getResponse()->setBody(json_encode($new_data));
	}
	
	public function loadMoreImageAction()
	{
		$current_page = $_POST['current_page'];
		$category = $_POST['category'];
		$pageSize = $_POST['page_size'];
		$pdpObject = new MST_Pdp_Block_Pdp();
		//$size = ceil($collection_counter/$page_size);
		$collection = $pdpObject->pagingCollection($current_page, $category, $pageSize);
		if ( count($collection) > 0) {
			$data = array();
			$pdpObject = Mage::getModel('pdp/pdp');
			foreach ($collection as $image) {
				$colorImg = $pdpObject->getColorImageFrontend($image->getImageId());
				$image->setColorImg($colorImg);
				$data[] = $image->getData();
			}
			$this->getResponse()->setBody(json_encode($data));
		} else {
			$this->getResponse()->setBody("nomore");
		}
	}
	
	public function getColorListAction() {
		$designId = $_POST['design_id'];
		if ($designId != "") {
			echo Mage::getModel('pdp/pdp')->getDesignColor($designId);
		}
	}

	public function updateDesignColorPositionAction() {
		$position = $_POST['position'];
		if ($position != "") {
			echo Mage::getModel('pdp/pdp')->updateDesignColorPosition($position);
		}
	}
	public function updateDesignColorPriceAction() {
		$price = $_POST['price'];
		if ($price != "") {
			echo Mage::getModel('pdp/pdp')->updateDesignColorPrice($price);
		}
	}
	public function updateDesignColorNameAction() {
		$colorName = $_POST['color_name'];
		if ($colorName != "") {
			echo Mage::getModel('pdp/pdp')->updateDesignColorName($colorName);
		}
	}
	public function updateDesignStyleAction() {
		$position = $_POST['position'];
		$price = $_POST['price'];
		$colorName = $_POST['color_name'];
		Mage::getModel('pdp/pdp')->updateDesignStyle($colorName, $price, $position);
	}
	public function saveAdminTemplateAction() {
		$data = $this->getRequest()->getPost();
		Mage::getModel('pdp/admintemplate')->saveAdminTemplate($data);
	}
    public function saveJsonfileAction() {
        $postData = $this->getRequest()->getPost();
        $jsonContent = $postData['json_file'];
        $jsonBaseDir = Mage::getBaseDir('media') . DS . "pdp" . DS . "json" . DS;
		$response = array();
		if(!file_exists($jsonBaseDir)) {
			mkdir($jsonBaseDir, 0777, true);
		}
		if (file_exists($jsonBaseDir)) {
			$jsonBaseUrl = Mage::getBaseUrl('media') . 'pdp/json/';
			$filename = "CustomOption" . time() . '.json';
			try {
				$result = file_put_contents($jsonBaseDir . $filename, $jsonContent);
				if ($result) {
					$jsonFileModel = Mage::getModel('pdp/jsonfile');
					$jsonFileModel->setFilename($filename);
					$jsonFileModel->save();
					if ($jsonFileModel->getId()) {
						$response['message'] = "Item saved successfully!";
						$response['filename']= $filename;
						$response['id'] = $jsonFileModel->getId();
						$response['full_path'] = $jsonBaseUrl . $filename;
					}
				}
			} catch(Exception $e) {
				$response['message'] = "Can not save json file!";
				//Zend_Debug::dump($e);
			}
		} else {
			$response['message'] = "Folder not exists!";
		}
        $this->getResponse()->setBody(json_encode($response));
    }
	public function uploadCustomImageAction() {
		if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES["uploads"])) {
			$uploads=$_FILES["uploads"];
			if (count($uploads['name'])>0) {
				$baseDir = Mage::getBaseDir('media') . DS . "pdp" . DS . "images" . DS . "upload" . DS;
				if (!file_exists($baseDir)) {
					mkdir($baseDir, 0777);
				}
				if (file_exists($baseDir)) {
					$mediaUrl = Mage::getBaseUrl(Mage_Core_Model_Store::URL_TYPE_MEDIA) . "pdp/images/upload/";
					$uploadedImages = array();
					foreach ($uploads['name'] as $key => $name) {
						if ($uploads['error'][$key] === UPLOAD_ERR_OK) {
							$filenameTemp = explode(".", $uploads["name"][$key]);
							$name = time() . '-customupload.' . end($filenameTemp);
							$size = $uploads["size"][$key];
							$type = $uploads["type"][$key]; // could be bogus!!! Users and browsers lie!!!
							$tmp  = $uploads["tmp_name"][$key];
							$result = move_uploaded_file( $tmp, $baseDir .$name);
							if ($result) {
								$uploadedImages[] = $mediaUrl . $name;
							}
						}
					}
					$key++;
					$this->setCustomImageSession($uploadedImages[0]);
					$this->getResponse()->setBody(json_encode($uploadedImages));
				}
			}
		}
	}
	public function setCustomImageSession($image) {
		$customImages = Mage::getSingleton("core/session")->getCustomUploadImages();
		$customImages[] = $image;
		Mage::getSingleton("core/session")->setCustomUploadImages($customImages);
	} 
	public function loadFontsAction() {
		$fonts = $this->getLayout()->createBlock("core/template")->setTemplate("pdp/design/load_font_after.phtml");
		$this->getResponse()->setBody($fonts->toHtml());
	}
}