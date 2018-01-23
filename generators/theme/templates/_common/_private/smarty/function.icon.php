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

/**
 * @param $params
 * @param $smarty
 *
 * @return bool|mixed|string
 */
function smarty_function_icon($params, $smarty)
{
    if (empty($params['id'])) {
        return false;
    }
    $id = uniqid('svg_');
    $opts = array_merge([
            'title' => '',
    ], $params);

    $smarty->smarty->loadPlugin('smarty_function_asset');
    $sprite = smarty_function_asset(['file' => 'img/icons.svg'], $smarty);

    $classNames = ['icon', 'icon--' . strtolower($params['id'])];
    if (!empty($params['className'])) {
        $classNames = array_merge($classNames, explode(' ', $params['className']));
        $classNames = array_filter($classNames);
        $classNames = array_unique($classNames);
    }
    $opts['className'] = implode(' ', $classNames);

    if (!empty($params['title'])) {
        $uid = uniqid($params['id'].'-');
        $markup = '<svg role="img" class="' . $params['className'] . '" aria-labelledby="' . $uid . '">' . PHP_EOL .
            '    <title id="' . $uid . '">' . $params['title'] . '</title>' . PHP_EOL .
            '    <use xlink:href="#' . $params['id'] . '"/>' . PHP_EOL .
            '</svg>';
    } else {
        $markup = '<svg role="img" class="' . $params['className'] . '" aria-hidden="true">' . PHP_EOL .
            '    <use xlink:href="#' . $params['id'] . '"/>' . PHP_EOL .
            '</svg>';
    }

    if (!empty($params['assign'])) {
        $smarty->assign($params['assign'], $markup);
    } else {
        return $markup;
    }
}
