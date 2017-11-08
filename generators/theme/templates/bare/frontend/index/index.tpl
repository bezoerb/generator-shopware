{extends file="parent:frontend/index/index.tpl"}


{block name="frontend_index_page_wrap"}
    <div class="page-wrap">

        {* Message if javascript is disabled *}
        {block name="frontend_index_no_script_message"}
            <noscript class="noscript-main">
                {include file="frontend/_includes/messages.tpl" type="warning" content="{s name="IndexNoscriptNotice"}{/s}" borderRadius=false}
            </noscript>
        {/block}

        {block name='frontend_index_before_page'}{/block}

        {* Shop header *}
        {block name='frontend_index_navigation'}
            <header class="header-main">
                {* Include the top bar navigation *}
                {block name='frontend_index_top_bar_container'}
                    {include file="frontend/index/topbar-navigation.tpl"}
                {/block}

                {block name='frontend_index_header_navigation'}
                    <div class="container header--navigation">

                        {* Logo container *}
                        {block name='frontend_index_logo_container'}
                            {include file="frontend/index/logo-container.tpl"}
                        {/block}

                        {* Shop navigation *}
                        {block name='frontend_index_shop_navigation'}
                            {include file="frontend/index/shop-navigation.tpl"}
                        {/block}

                        {block name='frontend_index_container_ajax_cart'}
                            <div class="container--ajax-cart" data-collapse-cart="true"{if $theme.offcanvasCart} data-displayMode="offcanvas"{/if}></div>
                        {/block}
                    </div>
                {/block}
            </header>

            {* Maincategories navigation top *}
            {block name='frontend_index_navigation_categories_top'}
                <nav class="navigation-main">
                    <div class="container" data-menu-scroller="true" data-listSelector=".navigation--list.container" data-viewPortSelector=".navigation--list-wrapper">
                        {block name="frontend_index_navigation_categories_top_include"}
                            {include file='frontend/index/main-navigation.tpl'}
                        {/block}
                    </div>
                </nav>
            {/block}
        {/block}

        {block name='frontend_index_emotion_loading_overlay'}
            {if $hasEmotion}
                <div class="emotion--overlay">
                    <i class="emotion--loading-indicator"></i>
                </div>
            {/if}
        {/block}

        {block name='frontend_index_content_main'}
            <section class="{block name="frontend_index_content_main_classes"}content-main container block-group{/block}">

                {* Breadcrumb *}
                {block name='frontend_index_breadcrumb'}
                    {if count($sBreadcrumb)}
                        <nav class="content--breadcrumb block">
                            {block name='frontend_index_breadcrumb_inner'}
                                {include file='frontend/index/breadcrumb.tpl'}
                            {/block}
                        </nav>
                    {/if}
                {/block}

                {* Content top container *}
                {block name="frontend_index_content_top"}{/block}

                <div class="content-main--inner">
                    {* Sidebar left *}
                    {block name='frontend_index_content_left'}
                        {include file='frontend/index/sidebar.tpl'}
                    {/block}

                    {* Main content *}
                    {block name='frontend_index_content_wrapper'}
                        <div class="content--wrapper">
                            {block name='frontend_index_content'}{/block}
                        </div>
                    {/block}

                    {* Sidebar right *}
                    {block name='frontend_index_content_right'}{/block}

                    {* Last seen products *}
                    {block name='frontend_index_left_last_articles'}
                        {if $sLastArticlesShow && !$isEmotionLandingPage}
                            {* Last seen products *}
                            <div class="last-seen-products is--hidden" data-last-seen-products="true">
                                <div class="last-seen-products--title">
                                    {s namespace="frontend/plugins/index/viewlast" name='WidgetsRecentlyViewedHeadline'}{/s}
                                </div>
                                <div class="last-seen-products--slider product-slider" data-product-slider="true">
                                    <div class="last-seen-products--container product-slider--container"></div>
                                </div>
                            </div>
                        {/if}
                    {/block}
                </div>
            </section>
        {/block}

        {* Footer *}
        {block name="frontend_index_footer"}
            <footer class="footer-main">
                <div class="container">
                    {block name="frontend_index_footer_container"}
                        {include file='frontend/index/footer.tpl'}
                    {/block}
                </div>
            </footer>
        {/block}

        {block name='frontend_index_body_inline'}{/block}
    </div>
{/block}



{* Scripts. *}
{* Use shopware compiled sources for production environments. *}
{* For other environments we use resources compiled by webpack *}
{block name="frontend_index_header_javascript_jquery_lib"}
    {if $Shopware->Container()->getParameter('kernel.environment') ne 'node'}
        <script src="{asset file='js/vendor.js'}"></script>
        {compileJavascript timestamp={themeTimestamp} output="javascriptFiles"}
        {foreach $javascriptFiles as $file}
            <script{if $theme.asyncJavascriptLoading} async{/if} src="{$file}" id="main-script"></script>
        {/foreach}
    {else}
        {* include dev js only in node environment *}
        <script src="/web/cache/vendor.js"></script>
        <script src="/web/cache/swag.js"></script>
        <script src="/web/cache/dev.js" id="main-script"></script>
    {/if}
{/block}
