{extends file="parent:frontend/index/header.tpl"}

{* Stylesheets *}
{* Use shopware compiled sources for production environments. *}
{* For other environments we use resources compiled by webpack *}
{block name="frontend_index_header_css_screen"}
  {if {env} ne "node"}
    {{compileLess timestamp={themeTimestamp} output="lessFiles"}}
    {foreach $lessFiles as $stylesheet}
      <link href="{$stylesheet}" media="all" rel="stylesheet" type="text/css"/>
    {/foreach}
  {else}
    <link href="/vendor.css" media="all" rel="stylesheet" type="text/css"/>
    <link href="/dev.css" media="all" rel="stylesheet" type="text/css"/>
  {/if}
  {if $theme.additionalCssData}
    {$theme.additionalCssData}
  {/if}
{/block}

