<?php
/**
 * Builds either an picture element or an image with srcset based on the params.
 * The params array knows the following key:
 * - image:
 * - desktop: explicit desktop image
 * - mobile: explicit mobile image
 * - className: optional className
 * - alt: optional alt tag
 * - breakpoint: optional breakpoint for mobile switch
 */
function smarty_function_img($params, $smarty)
{
  $params = array_merge([
    'itemprop' => 'image',
    'className' => '',
    'breakpoint' => '48rem'
  ], $params);

  $classNames = [];
  if (!empty($params['className']) && is_string($params['className'])) {
    $classNames = explode(' ', $params['className']);
  }

  $imageDefaults = [
    'alt' => '',
    'src' => '',
    'srcset' => '',
    'sizes' => '',
    'width' => '',
    'height' => '',
  ];

  $imageOverwrites = array_intersect_key($params, $imageDefaults);


  if (!empty($params['mobile']) && !empty($params['desktop'])) {
    if ($params['mobile'] instanceof \JsonSerializable) {
      $mobile = array_merge($imageDefaults, $params['mobile']->jsonSerialize(), $imageOverwrites);
    } elseif (is_array($params['mobile'])) {
      $mobile = array_merge($imageDefaults, $params['mobile'], $imageOverwrites);
    } else {
      $mobile = array_merge($imageDefaults, ['src' => $params['mobile']], $imageOverwrites);
    }

    if ($params['desktop'] instanceof \JsonSerializable) {
      $desktop = array_merge($imageDefaults, $params['desktop']->jsonSerialize(), $imageOverwrites);
    } elseif (is_array($params['desktop'])) {
      $desktop = array_merge($imageDefaults, $params['desktop'], $imageOverwrites);
    } else {
      $desktop = array_merge($imageDefaults, ['src' => $params['desktop']], $imageOverwrites);
    }

    if (!empty($params['alt'])) {
      $alt = $params['alt'];
    } elseif (!empty($desktop['alt'])) {
      $alt = $desktop['alt'];
    } elseif (!empty($mobile['alt'])) {
      $alt = $mobile['alt'];
    } else {
      $alt = '';
    }

    $html = sprintf(
      '<picture itemprop="%1$s" itemscope itemtype="https://schema.org/ImageObject">' . PHP_EOL .
      '<meta itemprop="name" content="%2$s">' . PHP_EOL .
      '<meta itemprop="url" content="%3$s">' . PHP_EOL .
      '<meta itemprop="width" content="%4$d">' . PHP_EOL .
      '<meta itemprop="height" content="%5$d">' . PHP_EOL .
      '<!--[if IE 9]><video style="display: none;"><![endif]-->' . PHP_EOL .
      '<source media="(min-width: %6$s)" srcset="%7$s" sizes="%8$s" />' . PHP_EOL .
      '<source media="(max-width: %6$s)" srcset="%9$s" sizes="%10$s" />' . PHP_EOL .
      '<!--[if IE 9]></video><![endif]-->' . PHP_EOL .
      '<img src="%11$s" itemprop="image" class="%12$s" alt="%13$s" />' . PHP_EOL .
      '</picture>',
      $params['itemprop'],
      $alt,
      $desktop['src'],
      $desktop['width'],
      $desktop['height'],
      $params['breakpoint'],
      $desktop['srcset'],
      $desktop['sizes'],
      $mobile['srcset'],
      $mobile['sizes'],
      $desktop['src'],
      implode(' ', $classNames),
      $alt
    );
  } else {
    if (!empty($params['desktop'])) {
      $params['image'] = $params['desktop'];
    } elseif (!empty($params['mobile'])) {
      $params['image'] = $params['mobile'];
    }

    if ($params['image'] instanceof \JsonSerializable) {
      $image = array_merge($imageDefaults, $params['image']->jsonSerialize(), $imageOverwrites);
    } elseif (is_array($params['image'])) {
      $image = array_merge($imageDefaults, $params['image'], $imageOverwrites);
    } else {
      $image = array_merge($imageDefaults, ['src' => $params['image']], $imageOverwrites);
    }

    if (preg_match('/\.svg(\?.*)?$/',$image['src'])) {
      $html = sprintf(
        '<img itemprop="%s" class="%s" src="%s" alt="%s">',
        $params['itemprop'],
        implode(' ', $classNames),
        $image['src'],
        $image['alt']
      );
    } else {
      $html = sprintf(
        '<img itemprop="%s" class="%s"sizes="%s" srcset="%s" src="%s" alt="%s">',
        $params['itemprop'],
        implode(' ', $classNames),
        $image['sizes'],
        $image['srcset'],
        $image['src'],
        $image['alt']
      );
    }
  }

  if (!empty($params['assign'])) {
    $smarty->assign($params['assign'], $html);
    return '';
  }

  return $html;
}
