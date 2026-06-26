/**
 * Obtém um valor do localStorage e faz o parse do JSON
 * @param key - Chave do localStorage
 * @returns O valor parseado ou null se não existir ou houver erro
 */
export function getLocalStorageItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return null;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error("Erro ao ler do localStorage:", error);
    return null;
  }
}

/**
 * Salva um valor no localStorage convertendo para JSON
 * @param key - Chave do localStorage
 * @param value - Valor a ser salvo (será convertido para JSON)
 */
export function setLocalStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Erro ao salvar no localStorage:", error);
  }
}

/**
 * Remove um item do localStorage
 * @param key - Chave do localStorage
 */
export function removeLocalStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Erro ao remover do localStorage:", error);
  }
}

/**
 * Gera uma chave de storage baseada em um prefixo e um ID
 * @param prefix - Prefixo da chave (ex: "title_suggestions")
 * @param id - ID do item
 * @returns Chave formatada (ex: "title_suggestions_123")
 */
export function getStorageKey(prefix: string, id: string | number): string {
  return `${prefix}_${id}`;
}

/**
 * Obtém um valor do localStorage usando um prefixo e ID
 * @param prefix - Prefixo da chave
 * @param id - ID do item
 * @returns O valor parseado ou null se não existir ou houver erro
 */
export function getLocalStorageItemByKey<T>(
  prefix: string,
  id: string | number
): T | null {
  const key = getStorageKey(prefix, id);
  return getLocalStorageItem<T>(key);
}

/**
 * Salva um valor no localStorage usando um prefixo e ID
 * @param prefix - Prefixo da chave
 * @param id - ID do item
 * @param value - Valor a ser salvo
 */
export function setLocalStorageItemByKey<T>(
  prefix: string,
  id: string | number,
  value: T
): void {
  const key = getStorageKey(prefix, id);
  setLocalStorageItem(key, value);
}

/**
 * Remove um item do localStorage usando um prefixo e ID
 * @param prefix - Prefixo da chave
 * @param id - ID do item
 */
export function removeLocalStorageItemByKey(
  prefix: string,
  id: string | number
): void {
  const key = getStorageKey(prefix, id);
  removeLocalStorageItem(key);
}
