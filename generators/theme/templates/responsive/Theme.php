<?php

namespace Shopware\Themes\<%= capitalizedThemename %>;

use Shopware\Components\Form as Form;

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
}
