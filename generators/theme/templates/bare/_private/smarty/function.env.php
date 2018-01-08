<?php

/**
 * Load a custom attribute by id and table
 *
 * @author Ben Zörb <ben@sommerlaune.com>
 *
 * @param $params
 * @param $smarty
 *
 * @return bool|mixed|string
 * @throws Exception
 */
function smarty_function_env($params, $smarty)
{
  $env = Shopware()->Container()->getParameter('kernel.environment');

  if (!empty($params['assign'])) {
    $smarty->assign($params['assign'], $env);
    return false;
  }

  return $env;
}
