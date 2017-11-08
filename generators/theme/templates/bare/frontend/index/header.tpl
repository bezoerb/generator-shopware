{extends file="parent:frontend/index/header.tpl"}

{* Stylesheets *}
{* Use shopware compiled sources for production environments. *}
{* For other environments we use resources compiled by webpack *}
{block name="frontend_index_header_css_screen"}
  {if $Shopware->Container()->getParameter('kernel.environment') ne "node"}
    {{compileLess timestamp={themeTimestamp} output="lessFiles"}}
    {foreach $lessFiles as $stylesheet}
      <link href="{$stylesheet}" media="all" rel="stylesheet" type="text/css" />
    {/foreach}
    {if $theme.additionalCssData}
      {$theme.additionalCssData}
    {/if}
  {else}
    <link href="/vendor.css" media="all" rel="stylesheet" type="text/css" />
    <link href="/dev.css" media="all" rel="stylesheet" type="text/css" />
  {/if}
{/block}

{* Drop Modernizr in the "<head>"-element *}
{block name="frontend_index_header_javascript_modernizr_lib"}
    {if !$theme.asyncJavascriptLoading}

    {/if}
{/block}

