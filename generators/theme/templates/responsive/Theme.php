<?php

namespace Shopware\Themes\<%= capitalizedThemename %>;

use Shopware\Components\Form as Form;
use Enlight_Loader;
use Enlight_Template_Manager;
use Doctrine\Common\Cache\Cache;

class Theme extends \Shopware\Components\Theme
{
    protected $extend = 'Responsive';

    protected $name = <<<'SHOPWARE_EOD'
<%= capitalizedThemename %>
SHOPWARE_EOD;

    protected $description = <<<'SHOPWARE_EOD'
Just another fabulous shopware theme
SHOPWARE_EOD;

    protected $author = <<<'SHOPWARE_EOD'

SHOPWARE_EOD;

    protected $license = <<<'SHOPWARE_EOD'

SHOPWARE_EOD;

    public function createConfig(Form\Container\TabContainer $container)
    {
    }

    /**
   * Get manifest
   * @param $file
   * @return string
   * @throws \Exception
   */
  public static function getAsset($file)
  {
    $cacheKey = 'Theme/Asset/Manifest';
    /** @var Cache $cacheSvc */
    $cacheSvc = Shopware()->Container()->get('models_metadata_cache');

    if (Shopware()->Container()->getParameter('kernel.environment') === 'node') {
      return '/'.$file;
    };

    $data = $cacheSvc->fetch($cacheKey);

    if (!$data) {
      $data = self::fetchAssetManifest();
      $cacheSvc->save($cacheKey, $data, 3600);
    }

    // first try convinient
    $hashed = '';
    if (array_key_exists('frontend/_resources/'.$file, $data)) {
      $hashed = $data['frontend/_resources/'.$file];
    } elseif (array_key_exists($file, $data)) {
      $hashed = $data[$file];
    }

    if ($hashed && file_exists(__DIR__.'/'.$hashed)) {
      return $hashed;
    }

    return $file;
  }

  /**
   * Get manifest
   * @return array
   * @throws \Exception
   */
  protected static function fetchAssetManifest()
  {

    /** @var Enlight_Template_Manager $compiler */
    $compiler = Shopware()->Container()->get('template');

    $file = 'frontend/_resources/rev-manifest.json';

    $manifest = [];

    // try to find the file on the filesystem
    foreach ($compiler->smarty->getTemplateDir() as $dir) {
      $json = '';
      if (file_exists($dir . $file)) {
        $file = Enlight_Loader::realpath($dir) . DS . str_replace('/', DS, $file);
        $json = file_get_contents($file);

      } else {
        if ($dir === '.' . DS) {
          $dir = '';
        }
        if (($result = Enlight_Loader::isReadable($dir . $file)) !== false) {
          $json = file_get_contents($result);
        }
      }

      $data = json_decode($json, true);

      if ($data && is_array($data)) {
        $manifest += $data;
      }
    }

    return $manifest;
  }
}
