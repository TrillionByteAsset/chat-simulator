import { author } from './author';
import { category } from './category';
import { localizedBody } from './objects/localizedBody';
import { localizedString } from './objects/localizedString';
import { localizedText } from './objects/localizedText';
import { post } from './post';
import { siteSettings } from './siteSettings';

export const schemaTypes = [
  localizedBody,
  localizedString,
  localizedText,
  author,
  category,
  post,
  siteSettings,
];
