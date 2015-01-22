<?php
class MST_Pdp_Block_Pdp extends Mage_Core_Block_Template
{
	public $_default_page_size = 10;
	protected $_fontPath;
	protected $_imagePath;
    protected $_artworkPath;
	protected $_helper;
	protected $_shareId;
	protected $_params;
	public function __construct() {
		$this->_helper = Mage::helper('pdp');
		$this->_fontPath = $this->_helper->getFontPath();
		$this->_imagePath = Mage::getBaseUrl(Mage_Core_Model_Store::URL_TYPE_MEDIA).'pdp/images/';
        $this->_artworkPath = $this->_imagePath . "artworks/";
		$this->_params = Mage::app()->getRequest()->getParams();
	}
	public function pagingCollection($current_page, $category, $page_size) {
		$collection = Mage::getModel('pdp/pdp')->getImageCollectionByCategory($category);
		$collection_counter = Mage::getModel('pdp/pdp')->getImageCollectionByCategory($category);
		$size = ceil(count($collection_counter) / $page_size);
		if ($current_page <= $size) {
			$collection->setCurPage($current_page);
			$collection->setPageSize($page_size);
			return $collection;
		}
	}
	public function getCurrentProductId() {
		if (Mage::registry('product-id')) {
			return Mage::registry('product-id');
		} else {
			$params = Mage::app()->getRequest()->getParams();
			if (isset($params['product-id'])) {
				return $params['product-id'];
			}
		}
		return null;
	}
	public function getProductInfo() {
		return Mage::getModel("catalog/product")->load($this->getCurrentProductId())->getData();
	}
	public function getFacebookInfo () {
		return Mage::helper('pdp')->getFacebookSetting();
	}
	public function getArtworkCategories() {
		return Mage::getModel('pdp/artworkcate')->getCategoryOptions();
	}
	public function getFonts() {
		return $this->_helper->getFonts();
	}
	public function getProductColorCollection() {
		$colorImageModel = Mage::getModel('pdp/pdpcolorimage');
		$colors = array();
		$productColors = Mage::getModel('pdp/pdpcolor')->getProductColorCollection($this->getCurrentProductId());
		foreach ($productColors as $productColor) {
			$images = $colorImageModel->getProductColorImage($productColor->getProductId(), $productColor->getId());
			$imageArr = array();
			foreach ($images as $image) {
				$imageArr[] = array(
					'filename' => $image->getFilename(),
					'side_id' => $image->getSideId()
				);
			}
			$itemData = $productColor->getData();
			$itemData['images'] = $imageArr;
			$colors[] = $itemData;
		}
		return $colors;
	}
	public function getViewMode () {
		$params = $this->_params;
		$viewMode = "product";
		if (isset($params['area']) && ($params['area'] == "backend" || $params['area'] == "customize")) {
			$viewMode = "backend";
		}
		return $viewMode;
	}
	public function getShareId() {
		$params = $this->_params;
		$this->_shareId = null;
		if (isset($params['share-id']) && $params['share-id'] != "") {
			$this->_shareId = $params['share-id'];
		}
		return $this->_shareId;
	}
	public function getOrderInfo() {
		$params = $this->_params;
		$orderId = $itemId = "";
		if (isset($params['order-id']) && $params['order-id'] != "") {
			$orderId = $params['order-id'];
		}
		if (isset($params['item-id']) && $params['item-id'] != "") {
			$itemId = $params['item-id'];
		}
		if ($orderId != "" && $itemId != "") {
			return array(
				'order-id' => $orderId,
				'item-id' => $itemId
			);
		}
		return null;
	}
	public function getProductConfig() {
		return Mage::helper("pdp")->getProductConfig($this->getCurrentProductId());
	}
	public function getJsonContentFromParam() {
		$jsonContent = "";
		if (isset($this->_params['json']) && $this->_params['json'] != "") {
			$jsonContent = $this->_helper->getPDPJsonContent($this->_params['json']);
		}
		return $jsonContent;
	}
	public function isAdminUser() {
		$isAdmin = false;
		if(isset($this->_params['area']) && isset($this->_params['key'])) {
			$isAdmin = true;
		}
		return $isAdmin;
	}
}