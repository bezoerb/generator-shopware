<?php
/**
 * Shopware 5
 * Copyright (c) shopware AG
 *
 * According to our dual licensing model, this program can be used either
 * under the terms of the GNU Affero General Public License, version 3,
 * or under a proprietary license.
 *
 * The texts of the GNU Affero General Public License with an additional
 * permission and of our proprietary license can be found at and
 * in the LICENSE file you have received along with this program.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * "Shopware" is a registered trademark of shopware AG.
 * The licensing of the program under the AGPLv3 does not imply a
 * trademark license. Therefore any rights, title and interest in
 * our trademarks remain entirely with us.
 */

use Doctrine\ORM\EntityNotFoundException;

/**
 * @param $params
 * @param $smarty
 *
 * @return bool|mixed|string
 */
function smarty_function_svg($params, $smarty)
{
    if (empty($params['id']) && empty($params['src'])) {
        return false;
    }

    $source = '';
    if (!empty($params['id'])) {
        try {
            $repository = Shopware()->Models()->getRepository('Shopware\Models\Media\Media');
            $media = $repository->find($params['id']);

            if (empty($media)) {
                return false;
            }

            // ensure we got a valid media object as the media repository returns a media object even if it's not there
            try {
                $path = $media->getPath();
            } catch (EntityNotFoundException $e) {
                $logger = Shopware()->Container()->get('pluginlogger');
                $logger->error('Error loading image'.$e->getMessage());

                return '';
            }
        } catch (\Doctrine\ORM\ORMException $e) {
            Shopware()->Container()->get('corelogger')->addError(sprintf('Unable to render SVG. Media "%s" not found', $params['id']));

            return false;
        }

        $mediaService = Shopware()->Container()->get('shopware_media.media_service');
        $source = $mediaService->read($path);
    } else {
        if (!empty($params['src'])) {
            $useIncludePath = $smarty->smarty->getUseIncludePath();
            $file = '';
            // try to find the file on the filesystem
            foreach ($smarty->smarty->getTemplateDir() as $dir) {
                if (file_exists($dir.$params['src'])) {
                    $file = Enlight_Loader::realpath($dir).DS.str_replace('/', DS, $params['src']);
                    break;
                }
                if (file_exists($dir.'frontend/_public/src/'.$params['src'])) {
                    $file = Enlight_Loader::realpath($dir).DS.str_replace('/', DS, 'frontend/_public/src/'.$params['src']);
                    break;
                }
                if ($useIncludePath) {
                    if ($dir === '.'.DS) {
                        $dir = '';
                    }
                    if (($result = Enlight_Loader::isReadable($dir.$params['src'])) !== false) {
                        $file = $result;
                        break;
                    }
                }
            }


            // Check if this a file path outside template
            if (!file_exists($file)) {
                $rootDir = Shopware()->Container()->getParameter('kernel.root_dir');
                $file = $rootDir.'/'.$params['src'];
            }

            if (file_exists($file)) {
                $source = file_get_contents($file);
            } elseif(strpos($params['src'],'://') !== false) {
              $source = file_get_contents($params['src']);
            } else {
                Shopware()->Container()->get('corelogger')->addError(sprintf('Unable to render SVG. Media "%s" not found', $params['src']));

                return false;
            }
        }
    }

    $classNames = ['icon', 'icon--'.strtolower(basename($file, '.svg'))];
    if (!empty($params['className'])) {
      $classNames = array_merge($classNames, explode(' ', $params['className']));
      $classNames = array_filter($classNames);
      $classNames = array_unique($classNames);
    }
    $source = str_replace('<svg ', '<svg class="'.implode(' ', $classNames).'" "', $source);

    // remove xml efinition
    $source = preg_replace('/<\?xml[^\>]+>/', '', $source);
    // remove doctype
    $source = preg_replace('/<!DOCTYPE[^\>]+>/', '', $source);
    // remove comments
    $source = preg_replace('/(<!--)[\s\S]*(-->)/', '', $source);

    if (!empty($params['assign'])) {
        $smarty->assign($params['assign'], trim($source));
    } else {
        return trim($source);
    }
}
