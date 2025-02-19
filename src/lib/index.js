export let translationPrefix = 'translation_';

export function getTranslationKeys() {
  let keys = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i);
    if (key?.startsWith(translationPrefix)) {
      keys.push(
        key.slice(translationPrefix.length)
      );
    }
  }

  return keys;
}