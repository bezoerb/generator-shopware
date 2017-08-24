{extends file="parent:frontend/index/index.tpl"}

{* Scripts. *}
{* Use shopware compiled sources for production environments. *}
{* For other environments we use resources compiled by webpack *}
{block name="frontend_index_header_javascript_jquery_lib"}
    {if $Shopware->Container()->getParameter('kernel.environment') ne 'node'}
      {compileJavascript timestamp={themeTimestamp} output="javascriptFiles"}
      {foreach $javascriptFiles as $file}
        <script{if $theme.asyncJavascriptLoading} async{/if} src="{$file}" id="main-script"></script>
      {/foreach}
    {else}
      {* include dev js only in node environment *}
      <script src="/web/cache/vendor.js"></script>
      <script src="/web/cache/dev.js"  id="main-script"></script>
    {/if}
{/block}
