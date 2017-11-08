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
 * Generate asset links based on rev manifest
 */
class Smarty_Compiler_Asset extends Smarty_Internal_CompileBase
{
    /**
     * Attribute definition: Overwrites base class.
     *
     * @var array
     * @see Smarty_Internal_CompileBase
     */
    public $required_attributes = array('file');

    /**
     * Array of names of valid option flags
     *
     * @var array
     */
    public $option_flags = array('fullPath');


    /**
     * @param $args
     * @param $compiler
     * @return string
     */
    public function compile($args, $compiler)
    {
        // check and get attributes
        $_attr = $this->getAttributes($compiler, $args);

        if (empty($_attr['file'])) {
            return false;
        }

        $file = trim($_attr['file'], '"\'');
        $fullPath = !empty($_attr['fullPath']);
        $manifest = $this->getManifest($compiler);

        if (preg_match('/^([\'"]?)[a-zA-Z0-9\/\.\-\_]+(\\1)$/', $_attr['file'], $match)) {
            $compiler->smarty->loadPlugin('smarty_function_fasset');
            return smarty_function_fasset(array(
                'file' => $file,
                'fullPath' => $fullPath,
                'manifest' => $manifest,
            ), $compiler);
        }



        return '<?php $_smarty_tpl->smarty->loadPlugin("smarty_function_fasset"); echo smarty_function_flink(array(' .
            '"file" => ' . $_attr['file'] . ', ' .
            '"fullPath" => ' . var_export($fullPath, true) . ', ' .
            '"manifest" => ' . var_export($manifest, true) . ', ' .
            '), $_smarty_tpl); ?>';
    }

    /**
     * Get manifest
     * @param $compiler
     * @return array
     */
    protected function getManifest($compiler)
    {
        $useIncludePath = $compiler->smarty->getUseIncludePath();
        $file = 'frontend/_resources/rev-manifest.json';

        $manifest = [];

        // try to find the file on the filesystem
        foreach ($compiler->smarty->getTemplateDir() as $dir) {
            $json = '';
            if (file_exists($dir . $file)) {
                $file = Enlight_Loader::realpath($dir) . DS . str_replace('/', DS, $file);
                $json = file_get_contents($file);

            } elseif ($useIncludePath) {
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
